const NUTRIENT_PRESENTATION = Object.freeze({
  proteinG: { label: "Protein", unit: "g", digits: 1 },
  carbohydratesG: { label: "Carbohydrates", unit: "g", digits: 1 },
  fatG: { label: "Fat", unit: "g", digits: 1 },
  fiberG: { label: "Fiber", unit: "g", digits: 1 },
  sugarG: { label: "Sugar", unit: "g", digits: 1 },
  sodiumMg: { label: "Sodium", unit: "mg", digits: 0 },
});

function requiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required daily tracker element: #${id}`);
  return element;
}

function rounded(value, digits = 0) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
  }).format(value);
}

function formatDate(value, { includeToday = false } = {}) {
  const date = new Date(`${value}T12:00:00.000Z`);
  const label = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(date);
  return includeToday ? `Today · ${label}` : label;
}

function formatTime(log) {
  const date = new Date(log.consumedAt);
  if (!Number.isFinite(date.getTime())) return "Time unavailable";
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: log.timezoneAtEntry,
    }).format(date);
  } catch {
    return "Time unavailable";
  }
}

function unitLabel(unit, quantity) {
  if (unit === "grams") return "g";
  if (unit === "milliliters") return "mL";
  if (unit === "cups") return quantity === 1 ? "cup" : "cups";
  if (unit === "pieces") return quantity === 1 ? "piece" : "pieces";
  return unit;
}

export function formatLoggedServing(log) {
  const quantity = rounded(log.enteredQuantity, 2);
  const descriptor = log.enteredDescriptor ? `${log.enteredDescriptor} ` : "";
  const entered = `${quantity} ${descriptor}${unitLabel(
    log.enteredUnit,
    log.enteredQuantity,
  )}`;
  const directUnit =
    (log.enteredUnit === "grams" && log.normalizedUnit === "g") ||
    (log.enteredUnit === "milliliters" && log.normalizedUnit === "ml");
  if (directUnit) return entered;
  return `${entered} · ${rounded(log.normalizedAmount, 2)} ${log.normalizedUnit}`;
}

function createLogItem(log, handlers) {
  const item = document.createElement("li");
  item.className = "daily-log-item";

  const details = document.createElement("div");
  details.className = "daily-log-item__details";
  const name = document.createElement("h3");
  name.textContent = log.foodNameSnapshot;
  const serving = document.createElement("p");
  serving.textContent = `${formatLoggedServing(log)} · ${formatTime(log)}`;
  details.append(name, serving);

  const calories = document.createElement("p");
  calories.className = "daily-log-item__calories";
  calories.textContent = `${rounded(log.caloriesKcal)} kcal`;
  calories.setAttribute("aria-label", `${rounded(log.caloriesKcal)} kilocalories`);

  const actions = document.createElement("div");
  actions.className = "daily-log-item__actions";
  const edit = document.createElement("button");
  edit.className = "button button--text";
  edit.type = "button";
  edit.textContent = "Edit";
  edit.setAttribute("aria-label", `Edit ${log.foodNameSnapshot}`);
  edit.addEventListener("click", () => handlers.onEditLog(log));
  const remove = document.createElement("button");
  remove.className = "button button--text daily-log-item__delete";
  remove.type = "button";
  remove.textContent = "Delete";
  remove.setAttribute("aria-label", `Delete ${log.foodNameSnapshot}`);
  remove.addEventListener("click", () => handlers.onDeleteLog(log));
  actions.append(edit, remove);

  item.append(details, calories, actions);
  return item;
}

export function createDailyView(handlers) {
  const elements = {
    announcement: requiredElement("daily-announcement"),
    comparison: requiredElement("daily-comparison"),
    content: requiredElement("daily-content"),
    date: requiredElement("daily-date"),
    dateLabel: requiredElement("daily-date-label"),
    empty: requiredElement("daily-empty"),
    error: requiredElement("daily-error"),
    errorMessage: requiredElement("daily-error-message"),
    list: requiredElement("daily-log-list"),
    listHeading: requiredElement("daily-log-heading"),
    loading: requiredElement("daily-loading"),
    meter: requiredElement("daily-calorie-meter"),
    meterGroup: requiredElement("daily-meter-group"),
    next: requiredElement("daily-next"),
    previous: requiredElement("daily-previous"),
    retry: requiredElement("daily-retry"),
    section: requiredElement("daily-tracker"),
    target: requiredElement("daily-target"),
    today: requiredElement("daily-today"),
    totalCalories: requiredElement("daily-calories"),
  };
  const nutrientElements = Object.fromEntries(
    Object.keys(NUTRIENT_PRESENTATION).map((field) => [
      field,
      {
        note: requiredElement(`daily-${field}-note`),
        value: requiredElement(`daily-${field}`),
      },
    ]),
  );

  let announcementToken = 0;

  function announce(message) {
    if (!message) return;
    announcementToken += 1;
    const token = announcementToken;
    elements.announcement.textContent = "";
    requestAnimationFrame(() => {
      if (token === announcementToken) elements.announcement.textContent = message;
    });
  }

  function setDateControls(selectedDate, today) {
    if (selectedDate) elements.date.value = selectedDate;
    if (today) elements.date.max = today;
    elements.next.disabled = !selectedDate || !today || selectedDate >= today;
    elements.today.disabled = !selectedDate || selectedDate === today;
  }

  function hideStates() {
    elements.loading.hidden = true;
    elements.error.hidden = true;
    elements.content.hidden = true;
  }

  function renderNutrients(nutrients) {
    for (const [field, presentation] of Object.entries(NUTRIENT_PRESENTATION)) {
      const total = nutrients[field];
      const output = nutrientElements[field];
      output.note.hidden = true;
      if (total.availability === "unavailable") {
        output.value.textContent = "Not available";
        continue;
      }

      output.value.textContent = `${rounded(total.value, presentation.digits)} ${presentation.unit}`;
      if (total.availability === "partial") {
        output.note.textContent = "Known total; some entries unavailable";
        output.note.hidden = false;
      }
    }
  }

  function renderTarget(summary) {
    if (summary.comparison.status === "unavailable") {
      elements.target.textContent = "Not available";
      elements.comparison.textContent =
        "No calorie target was available for this day.";
      elements.meterGroup.hidden = true;
      return;
    }

    const calories = rounded(summary.totals.caloriesKcal);
    const target = rounded(summary.targetKcal);
    const amount = rounded(summary.comparison.amountKcal);
    elements.target.textContent = `${target} kcal`;
    elements.comparison.textContent =
      summary.comparison.status === "remaining"
        ? `${amount} kcal remaining`
        : `${amount} kcal above target`;
    elements.meter.max = summary.targetKcal;
    elements.meter.value = Math.min(
      summary.totals.caloriesKcal,
      summary.targetKcal,
    );
    const meterText = `${calories} kilocalories consumed; ${elements.comparison.textContent.toLowerCase()}.`;
    elements.meter.setAttribute("aria-valuetext", meterText);
    elements.meter.textContent = meterText;
    elements.meterGroup.hidden = false;
  }

  elements.previous.addEventListener("click", handlers.onPrevious);
  elements.next.addEventListener("click", handlers.onNext);
  elements.today.addEventListener("click", handlers.onToday);
  elements.retry.addEventListener("click", handlers.onRetry);
  elements.date.addEventListener("change", (event) =>
    handlers.onSelectDate(event.currentTarget.value),
  );

  return Object.freeze({
    reset() {
      hideStates();
      elements.section.hidden = true;
      elements.section.removeAttribute("aria-busy");
      elements.list.replaceChildren();
      elements.announcement.textContent = "";
    },
    showError({ selectedDate, today, sessionExpired }) {
      elements.section.hidden = false;
      hideStates();
      setDateControls(selectedDate, today);
      elements.errorMessage.textContent = sessionExpired
        ? "Your session has ended. Log in again to load your daily tracker."
        : "We couldn't load this day. Check your connection and try again.";
      elements.retry.hidden = sessionExpired;
      elements.error.hidden = false;
      elements.section.setAttribute("aria-busy", "false");
      announce(elements.errorMessage.textContent);
    },
    showLoading({ selectedDate, today, announce: shouldAnnounce }) {
      elements.section.hidden = false;
      hideStates();
      setDateControls(selectedDate, today);
      elements.dateLabel.textContent = selectedDate
        ? formatDate(selectedDate, { includeToday: selectedDate === today })
        : "Selected day";
      elements.loading.hidden = false;
      elements.section.setAttribute("aria-busy", "true");
      if (shouldAnnounce) announce("Loading the selected day.");
    },
    showSummary(summary) {
      elements.section.hidden = false;
      hideStates();
      setDateControls(summary.selectedDate, summary.today);
      elements.dateLabel.textContent = formatDate(summary.selectedDate, {
        includeToday: summary.isToday,
      });
      elements.totalCalories.textContent = `${rounded(
        summary.totals.caloriesKcal,
      )} kcal`;
      renderTarget(summary);
      renderNutrients(summary.totals.nutrients);

      elements.list.replaceChildren(
        ...summary.logs.map((log) => createLogItem(log, handlers)),
      );
      elements.empty.hidden = summary.logs.length !== 0;
      elements.list.hidden = summary.logs.length === 0;
      elements.listHeading.textContent = `Logged foods (${summary.logs.length})`;
      elements.content.hidden = false;
      elements.section.setAttribute("aria-busy", "false");
      announce(
        summary.logs.length === 0
          ? `No food logged for ${formatDate(summary.selectedDate)}.`
          : `${summary.logs.length} food ${
              summary.logs.length === 1 ? "entry" : "entries"
            } loaded for ${formatDate(summary.selectedDate)}.`,
      );
    },
  });
}
