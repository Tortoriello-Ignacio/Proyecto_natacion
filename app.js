// =============================
// VARIABLES GLOBALES
// =============================

let trainings = JSON.parse(localStorage.getItem("trainings")) || [];
let routines = JSON.parse(localStorage.getItem("routines")) || [];
let settings = JSON.parse(localStorage.getItem("settings")) || {
  weeklyGoal: 9000,
};

let currentDate = new Date();
let currentFilter = "all";

// =============================
// SELECTORES DEL DOM
// =============================

const weeklyMetersEl = document.getElementById("weeklyMeters");
const weeklyGoalEl = document.getElementById("weeklyGoal");
const completedTrainingsEl = document.getElementById("completedTrainings");
const averageRpeEl = document.getElementById("averageRpe");
const progressPercentageEl = document.getElementById("progressPercentage");
const progressFillEl = document.getElementById("progressFill");

const monthlyMetersEl = document.getElementById("monthlyMeters");
const averageMetersEl = document.getElementById("averageMeters");
const longestTrainingEl = document.getElementById("longestTraining");
const monthlySessionsEl = document.getElementById("monthlySessions");

const calendarGrid = document.getElementById("calendarGrid");
const currentMonthEl = document.getElementById("currentMonth");
const prevMonthBtn = document.getElementById("prevMonthBtn");
const nextMonthBtn = document.getElementById("nextMonthBtn");

const completedTrainingForm = document.getElementById("completedTrainingForm");
const plannedTrainingForm = document.getElementById("plannedTrainingForm");
const goalForm = document.getElementById("goalForm");
const weeklyGoalInput = document.getElementById("weeklyGoalInput");

const trainingList = document.getElementById("trainingList");

const showAllBtn = document.getElementById("showAllBtn");
const showCompletedBtn = document.getElementById("showCompletedBtn");
const showPlannedBtn = document.getElementById("showPlannedBtn");

const trainingModal = document.getElementById("trainingModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBody = document.getElementById("modalBody");
const rocioWeeklyMetersEl = document.getElementById("rocioWeeklyMeters");
const ignacioWeeklyMetersEl = document.getElementById("ignacioWeeklyMeters");

const routineForm = document.getElementById("routineForm");
const routineList = document.getElementById("routineList");
const routineSelect = document.getElementById("routineSelect");

// =============================
// LOCAL STORAGE
// =============================

function saveTrainings() {
  localStorage.setItem("trainings", JSON.stringify(trainings));
}

function saveRoutines() {
  localStorage.setItem("routines", JSON.stringify(routines));
}

function saveSettings() {
  localStorage.setItem("settings", JSON.stringify(settings));
}

// =============================
// FUNCIONES DE FECHAS
// =============================

function getDateFromInput(dateString) {
  return new Date(dateString + "T00:00:00");
}

function formatDate(dateString) {
  const date = getDateFromInput(dateString);

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getMonthName(date) {
  return date.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
}

function isSameMonth(dateString, dateReference) {
  const date = getDateFromInput(dateString);

  return (
    date.getMonth() === dateReference.getMonth() &&
    date.getFullYear() === dateReference.getFullYear()
  );
}

function getCurrentWeekRange() {
  const today = new Date();
  const day = today.getDay();

  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

function isCurrentWeek(dateString) {
  const date = getDateFromInput(dateString);
  const { monday, sunday } = getCurrentWeekRange();

  return date >= monday && date <= sunday;
}

// =============================
// DASHBOARD
// =============================

function updateDashboard() {
  const completedTrainings = trainings.filter(
    (training) => training.status === "completed"
  );

  const weeklyCompletedTrainings = completedTrainings.filter((training) =>
    isCurrentWeek(training.date)
  );

  const weeklyMeters = weeklyCompletedTrainings.reduce(
    (total, training) => total + Number(training.meters),
    0
  );

  const rocioWeeklyMeters = weeklyCompletedTrainings
  .filter((training) => training.swimmer === "Rocío")
  .reduce((total, training) => total + Number(training.meters), 0);

const ignacioWeeklyMeters = weeklyCompletedTrainings
  .filter((training) => training.swimmer === "Ignacio")
  .reduce((total, training) => total + Number(training.meters), 0);

rocioWeeklyMetersEl.textContent = `${rocioWeeklyMeters} m`;
ignacioWeeklyMetersEl.textContent = `${ignacioWeeklyMeters} m`;

  const trainingsWithRpe = weeklyCompletedTrainings.filter(
    (training) => training.rpe
  );

  const averageRpe =
    trainingsWithRpe.length > 0
      ? (
          trainingsWithRpe.reduce(
            (total, training) => total + Number(training.rpe),
            0
          ) / trainingsWithRpe.length
        ).toFixed(1)
      : 0;

  const progressPercentage = Math.min(
    Math.round((weeklyMeters / settings.weeklyGoal) * 100),
    100
  );

  weeklyMetersEl.textContent = `${weeklyMeters} m`;
  weeklyGoalEl.textContent = `${settings.weeklyGoal} m`;
  completedTrainingsEl.textContent = weeklyCompletedTrainings.length;
  averageRpeEl.textContent = averageRpe;
  progressPercentageEl.textContent = `${progressPercentage}%`;
  progressFillEl.style.width = `${progressPercentage}%`;

  weeklyGoalInput.value = settings.weeklyGoal;
}

// =============================
// ESTADÍSTICAS
// =============================

function updateStats() {
  const completedTrainingsThisMonth = trainings.filter(
    (training) =>
      training.status === "completed" && isSameMonth(training.date, currentDate)
  );

  const totalMeters = completedTrainingsThisMonth.reduce(
    (total, training) => total + Number(training.meters),
    0
  );

  const averageMeters =
    completedTrainingsThisMonth.length > 0
      ? Math.round(totalMeters / completedTrainingsThisMonth.length)
      : 0;

  const longestTraining =
    completedTrainingsThisMonth.length > 0
      ? Math.max(
          ...completedTrainingsThisMonth.map((training) =>
            Number(training.meters)
          )
        )
      : 0;

  monthlyMetersEl.textContent = `${totalMeters} m`;
  averageMetersEl.textContent = `${averageMeters} m`;
  longestTrainingEl.textContent = `${longestTraining} m`;
  monthlySessionsEl.textContent = completedTrainingsThisMonth.length;
}

// =============================
// CALENDARIO
// =============================

function renderCalendar() {
  calendarGrid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  currentMonthEl.textContent = capitalize(getMonthName(currentDate));

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const totalDays = lastDayOfMonth.getDate();

  let startDay = firstDayOfMonth.getDay();

  // Adaptamos el calendario para que empiece el lunes
  startDay = startDay === 0 ? 6 : startDay - 1;

  for (let i = 0; i < startDay; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.classList.add("calendar-day", "empty");
    calendarGrid.appendChild(emptyDay);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayEl = document.createElement("div");
    dayEl.classList.add("calendar-day");

    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const dayTrainings = trainings.filter(
      (training) => training.date === dateString
    );

    dayEl.innerHTML = `
      <div class="day-number">${day}</div>
    `;

    dayTrainings.forEach((training) => {
      const trainingBadge = document.createElement("div");
      trainingBadge.classList.add("day-training", training.status);

      trainingBadge.textContent =
        training.status === "completed"
          ? `${training.swimmer || ""}: ${training.meters} m | RPE ${training.rpe || "-"}`
          : `${training.swimmer || ""}: Plan ${training.meters} m`;
      trainingBadge.addEventListener("click", (event) => {
        event.stopPropagation();
        openTrainingModal(training.id);
      });

      dayEl.appendChild(trainingBadge);
    });

    dayEl.addEventListener("click", () => {
      if (dayTrainings.length > 0) {
        openDayModal(dateString, dayTrainings);
      }
    });

    calendarGrid.appendChild(dayEl);
  }
}

// =============================
// HISTORIAL
// =============================

function renderTrainingList() {
  trainingList.innerHTML = "";

  let filteredTrainings = [...trainings];

  if (currentFilter === "completed") {
    filteredTrainings = trainings.filter(
      (training) => training.status === "completed"
    );
  }

  if (currentFilter === "planned") {
    filteredTrainings = trainings.filter(
      (training) => training.status === "planned"
    );
  }

  filteredTrainings.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filteredTrainings.length === 0) {
    trainingList.innerHTML = `
      <p class="empty-message">Todavía no hay entrenamientos para mostrar.</p>
    `;
    return;
  }

  filteredTrainings.forEach((training) => {
    const trainingItem = document.createElement("article");
    trainingItem.classList.add("training-item");

    const statusText =
      training.status === "completed" ? "Realizado" : "Planificado";

    trainingItem.innerHTML = `
      <div class="training-info">
        <h3>${training.swimmer || "Sin nadador"} | ${training.type} - ${training.meters} m</h3>
        <p>Fecha: ${formatDate(training.date)}</p>
        ${
          training.status === "completed"
            ? `<p>Duración: ${training.duration} min | RPE: ${training.rpe}</p>`
            : `<p>Objetivo: ${training.objective || "Sin objetivo específico"}</p>`
        }
      </div>

      <div class="training-actions">
        <span class="training-status ${training.status}">
          ${statusText}
        </span>

        <button class="secondary-btn" onclick="openTrainingModal('${training.id}')">
          Ver
        </button>

        ${
          training.status === "planned"
            ? `<button class="secondary-btn" onclick="markAsCompleted('${training.id}')">
                Marcar realizado
              </button>`
            : ""
        }

        <button class="danger-btn" onclick="deleteTraining('${training.id}')">
          Eliminar
        </button>
      </div>
    `;

    trainingList.appendChild(trainingItem);
  });
}

// =============================
// FORMULARIO ENTRENAMIENTO REALIZADO
// =============================

completedTrainingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const training = {
    id: crypto.randomUUID(),
    swimmer: document.getElementById("completedSwimmer").value,
    date: document.getElementById("completedDate").value,
    meters: Number(document.getElementById("completedMeters").value),
    duration: Number(document.getElementById("completedDuration").value),
    rpe: Number(document.getElementById("completedRpe").value),
    type: document.getElementById("completedType").value,
    notes: document.getElementById("completedNotes").value.trim(),
    status: "completed",
};

  trainings.push(training);
  saveTrainings();

  completedTrainingForm.reset();
  refreshApp();
});

// =============================
// FORMULARIO PLANIFICACIÓN
// =============================

plannedTrainingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const training = {
    id: crypto.randomUUID(),
    swimmer: document.getElementById("plannedSwimmer").value,
    routineId: routineSelect.value || null,
    date: document.getElementById("plannedDate").value,
    meters: Number(document.getElementById("plannedMeters").value),
    duration: null,
    rpe: null,
    type: document.getElementById("plannedType").value,
    objective: document.getElementById("plannedObjective").value.trim(),
    notes: document.getElementById("plannedNotes").value.trim(),
    status: "planned",
};

  trainings.push(training);
  saveTrainings();

  plannedTrainingForm.reset();
  refreshApp();
});

// =============================
// FORMULARIO OBJETIVO SEMANAL
// =============================

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newGoal = Number(weeklyGoalInput.value);

  if (newGoal <= 0) {
    alert("El objetivo semanal debe ser mayor a 0.");
    return;
  }

  settings.weeklyGoal = newGoal;
  saveSettings();

  refreshApp();
});

// =============================
// BOTONES DE FILTRO
// =============================

showAllBtn.addEventListener("click", () => {
  currentFilter = "all";
  renderTrainingList();
});

showCompletedBtn.addEventListener("click", () => {
  currentFilter = "completed";
  renderTrainingList();
});

showPlannedBtn.addEventListener("click", () => {
  currentFilter = "planned";
  renderTrainingList();
});

// =============================
// BOTONES CALENDARIO
// =============================

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  refreshApp();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  refreshApp();
});

// =============================
// MODAL
// =============================

function openTrainingModal(trainingId) {
  const training = trainings.find((item) => item.id === trainingId);

  if (!training) return;

  modalBody.innerHTML = `
    <p><strong>Fecha:</strong> ${formatDate(training.date)}</p>
    <p><strong>Nadador/a:</strong> ${training.swimmer || "Sin especificar"}</p>
    <p><strong>Tipo:</strong> ${training.type}</p>
    <p><strong>Metros:</strong> ${training.meters} m</p>
    <p><strong>Estado:</strong> ${
      training.status === "completed" ? "Realizado" : "Planificado"
    }</p>
    ${
      training.status === "completed"
        ? `
          <p><strong>Duración:</strong> ${training.duration} minutos</p>
          <p><strong>RPE:</strong> ${training.rpe}</p>
        `
        : `
          <p><strong>Objetivo:</strong> ${
            training.objective || "Sin objetivo específico"
          }</p>
        `
    }
    <p><strong>Notas:</strong> ${training.notes || "Sin notas"}</p>
  `;

  trainingModal.classList.remove("hidden");
}

function openDayModal(dateString, dayTrainings) {
  modalBody.innerHTML = `
    <p><strong>Fecha:</strong> ${formatDate(dateString)}</p>
    <hr style="border-color: rgba(255,255,255,0.1); margin: 12px 0;">
    ${dayTrainings
      .map(
        (training) => `
          <p>
            <strong>${training.type}</strong> -
            ${training.meters} m -
            ${training.status === "completed" ? "Realizado" : "Planificado"}
          </p>
        `
      )
      .join("")}
  `;

  trainingModal.classList.remove("hidden");
}

closeModalBtn.addEventListener("click", () => {
  trainingModal.classList.add("hidden");
});

trainingModal.addEventListener("click", (event) => {
  if (event.target === trainingModal) {
    trainingModal.classList.add("hidden");
  }
});

// =============================
// ACCIONES DE ENTRENAMIENTOS
// =============================

function deleteTraining(trainingId) {
  const confirmDelete = confirm("¿Querés eliminar este entrenamiento?");

  if (!confirmDelete) return;

  trainings = trainings.filter((training) => training.id !== trainingId);
  saveTrainings();

  refreshApp();
}

function markAsCompleted(trainingId) {
  const training = trainings.find((item) => item.id === trainingId);

  if (!training) return;

  const realMeters = prompt(
    "¿Cuántos metros hiciste realmente?",
    training.meters
  );

  const duration = prompt("¿Cuánto duró el entrenamiento en minutos?", "60");

  const rpe = prompt("¿Qué RPE alcanzaste? Del 1 al 10", "7");

  if (!realMeters || !duration || !rpe) {
    alert("No se completó la actualización.");
    return;
  }

  training.meters = Number(realMeters);
  training.duration = Number(duration);
  training.rpe = Number(rpe);
  training.status = "completed";

  saveTrainings();
  refreshApp();
}

// =============================
// REPERTORIO DE RUTINAS
// =============================

routineForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const routine = {
    id: crypto.randomUUID(),
    name: document.getElementById("routineName").value.trim(),
    swimmer: document.getElementById("routineSwimmer").value,
    meters: Number(document.getElementById("routineMeters").value),
    type: document.getElementById("routineType").value,
    description: document.getElementById("routineDescription").value.trim(),
    createdAt: new Date().toISOString(),
  };

  routines.push(routine);
  saveRoutines();

  routineForm.reset();
  refreshApp();
});

function renderRoutines() {
  routineList.innerHTML = "";

  routineSelect.innerHTML = `
    <option value="">Seleccionar rutina guardada</option>
  `;

  routines.forEach((routine) => {
    const option = document.createElement("option");
    option.value = routine.id;
    option.textContent = `${routine.name} | ${routine.meters} m | ${routine.swimmer}`;
    routineSelect.appendChild(option);
  });

  if (routines.length === 0) {
    routineList.innerHTML = `
      <p class="empty-message">Todavía no hay rutinas guardadas en el repertorio.</p>
    `;
    return;
  }

  routines.forEach((routine) => {
    const routineCard = document.createElement("article");
    routineCard.classList.add("routine-card");

    routineCard.innerHTML = `
      <h3>${routine.name}</h3>

      <div class="routine-meta">
        <span>${routine.swimmer}</span>
        <span>${routine.meters} m</span>
        <span>${routine.type}</span>
      </div>

      <p>${routine.description}</p>

      <div class="routine-actions">
        <button class="secondary-btn" onclick="fillPlanningWithRoutine('${routine.id}')">
          Usar para planificar
        </button>

        <button class="danger-btn" onclick="deleteRoutine('${routine.id}')">
          Eliminar rutina
        </button>
      </div>
    `;

    routineList.appendChild(routineCard);
  });
}

function fillPlanningWithRoutine(routineId) {
  const routine = routines.find((item) => item.id === routineId);

  if (!routine) return;

  routineSelect.value = routine.id;

  if (routine.swimmer !== "Ambos") {
    document.getElementById("plannedSwimmer").value = routine.swimmer;
  }

  document.getElementById("plannedMeters").value = routine.meters;
  document.getElementById("plannedType").value = routine.type;
  document.getElementById("plannedObjective").value = routine.name;
  document.getElementById("plannedNotes").value = routine.description;

  document.getElementById("plannedDate").focus();
}

function deleteRoutine(routineId) {
  const confirmDelete = confirm("¿Querés eliminar esta rutina del repertorio?");

  if (!confirmDelete) return;

  routines = routines.filter((routine) => routine.id !== routineId);
  saveRoutines();

  refreshApp();
}

routineSelect.addEventListener("change", () => {
  if (!routineSelect.value) return;

  fillPlanningWithRoutine(routineSelect.value);
});

// =============================
// UTILIDADES
// =============================

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function refreshApp() {
  updateDashboard();
  updateStats();
  renderCalendar();
  renderTrainingList();
  renderRoutines();
}

// =============================
// INICIALIZACIÓN
// =============================

refreshApp();