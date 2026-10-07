function requiredElement(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required weekly tracker element: #${id}`);
  return element;
}

function rounded(value) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value);
}

function dateFromIso(value) {
  return new Date(`${value}T12:00:00.000Z`);
}

function formatWeekRange(startDate, endDate) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
  return `${formatter.format(dateFromIso(startDate))} – ${formatter.format(
    dateFromIso(endDate),
  )}`;
}

function formatDay(value) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    weekday: "short",
  }).format(dateFromIso(value));
}

function comparisonText(row) {
  if (row.comparison.status === "future") return "Upcoming day";
  if (row.comparison.status === "unavailable") return "Target unavailable";
  const amount = rounded(row.comparison.amountKcal);
  return row.comparison.status === "remaining"
    ? `${amount} kcal remaining`
    : `${amount} kcal above target`;
}

function createDayItem(row) {
  const item = document.createElement("li");
  item.className = "weekly-day";
  if (row.isToday) item.classList.add("weekly-day--today");
  if (row.isFuture) item.classList.add("weekly-day--future");

  const header = document.createElement("header");
  const heading = document.createElement("h4");
  const time = document.createElement("time");
  time.dateTime = row.localDate;
  time.textContent = formatDay(row.localDate);
  heading.append(time);
  const context = document.createElement("span");
  context.textContent = row.isToday
    ? "Today"
    : row.isFuture
      ? "Upcoming"
      : `${row.totals.entryCount} ${row.totals.entryCount === 1 ? "entry" : "entries"}`;
  header.append(heading, context);

  const values = document.createElement("dl");
  values.className = "weekly-day__values";
  const fields = [
    ["Consumed", row.isFuture ? "Not started" : `${rounded(row.totals.caloriesKcal)} kcal`],
    ["Estimated target", row.targetKcal === null ? "Not available" : `${rounded(row.targetKcal)} kcal`],
  ];
  for (const [label, value] of fields) {
    const group = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = value;
    group.append(term, description);
    values.append(group);
  }

  const comparison = document.createElement("p");
  comparison.className = "weekly-day__comparison";
  comparison.textContent = comparisonText(row);
  item.append(header, values, comparison);
  return item;
}

export function createWeeklyView(handlers) {
  const elements = {
    announcement: requiredElement("weekly-announcement"),
    averageIntake: requiredElement("weekly-average-intake"),
    averageNote: requiredElement("weekly-average-note"),
    averageTarget: requiredElement("weekly-average-target"),
    content: requiredElement("weekly-content"),
    current: requiredElement("weekly-current"),
    empty: requiredElement("weekly-empty"),
    error: requiredElement("weekly-error"),
    errorMessage: requiredElement("weekly-error-message"),
    list: requiredElement("weekly-day-list"),
    loading: requiredElement("weekly-loading"),
    next: requiredElement("weekly-next"),
    previous: requiredElement("weekly-previous"),
    rangeLabel: requiredElement("weekly-range-label"),
    retry: requiredElement("weekly-retry"),
    section: requiredElement("weekly-tracker"),
  };

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

  function setControls(selectedWeekStart, currentWeekStart) {
    elements.next.disabled =
      !selectedWeekStart ||
      !currentWeekStart ||
      selectedWeekStart >= currentWeekStart;
    elements.current.disabled =
      !selectedWeekStart || selectedWeekStart === currentWeekStart;
  }

  function hideStates() {
    elements.loading.hidden = true;
    elements.error.hidden = true;
    elements.content.hidden = true;
  }

  elements.previous.addEventListener("click", handlers.onPrevious);
  elements.next.addEventListener("click", handlers.onNext);
  elements.current.addEventListener("click", handlers.onCurrent);
  elements.retry.addEventListener("click", handlers.onRetry);

  return Object.freeze({
    reset() {
      hideStates();
      elements.section.hidden = true;
      elements.section.removeAttribute("aria-busy");
      elements.list.replaceChildren();
      elements.announcement.textContent = "";
    },
    showError({
      selectedWeekStart,
      selectedWeekEnd,
      currentWeekStart,
      sessionExpired,
    }) {
      elements.section.hidden = false;
      hideStates();
      setControls(selectedWeekStart, currentWeekStart);
      if (selectedWeekStart && selectedWeekEnd) {
        elements.rangeLabel.textContent = formatWeekRange(
          selectedWeekStart,
          selectedWeekEnd,
        );
      }
      elements.errorMessage.textContent = sessionExpired
        ? "Your session has ended. Log in again to load weekly history."
        : "We couldn't load this week. Check your connection and try again.";
      elements.retry.hidden = sessionExpired;
      elements.error.hidden = false;
      elements.section.setAttribute("aria-busy", "false");
      announce(elements.errorMessage.textContent);
    },
    showLoading({
      selectedWeekStart,
      selectedWeekEnd,
      currentWeekStart,
      announce: shouldAnnounce,
    }) {
      elements.section.hidden = false;
      hideStates();
      setControls(selectedWeekStart, currentWeekStart);
      elements.rangeLabel.textContent = formatWeekRange(
        selectedWeekStart,
        selectedWeekEnd,
      );
      elements.loading.hidden = false;
      elements.section.setAttribute("aria-busy", "true");
      if (shouldAnnounce) announce("Loading the selected week.");
    },
    showSummary(summary) {
      elements.section.hidden = false;
      hideStates();
      setControls(summary.selectedWeekStart, summary.currentWeekStart);
      elements.rangeLabel.textContent = `${summary.isCurrentWeek ? "Current week · " : ""}${formatWeekRange(
        summary.selectedWeekStart,
        summary.selectedWeekEnd,
      )}`;
      elements.averageIntake.textContent = `${rounded(
        summary.averageIntakeKcal,
      )} kcal`;
      elements.averageTarget.textContent =
        summary.averageTargetKcal === null
          ? "Not available"
          : `${rounded(summary.averageTargetKcal)} kcal`;

      const dayWord = summary.elapsedDayCount === 1 ? "day" : "days";
      const targetCoverage =
        summary.targetAvailability === "unavailable"
          ? " No applicable targets were available."
          : summary.targetAvailability === "partial"
            ? ` Average target uses ${summary.targetDayCount} of those days with an applicable target.`
            : " Average target covers the same days.";
      elements.averageNote.textContent = `Average intake uses ${summary.elapsedDayCount} elapsed ${dayWord}, including zero-log days.${targetCoverage}`;

      elements.list.replaceChildren(...summary.rows.map(createDayItem));
      elements.empty.hidden = !summary.hasNoHistory;
      elements.content.hidden = false;
      elements.section.setAttribute("aria-busy", "false");
      announce(
        summary.hasNoHistory
          ? `No food logged for ${formatWeekRange(summary.selectedWeekStart, summary.selectedWeekEnd)}.`
          : `Weekly history loaded for ${formatWeekRange(summary.selectedWeekStart, summary.selectedWeekEnd)}.`,
      );
    },
  });
}
