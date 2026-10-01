"use strict";

const STORAGE_KEY = "daily-canvas.entries.v1";
const MOOD_PREFERENCES_KEY = "daily-canvas.mood-preferences.v1";
const MAX_ENTRY_LENGTH = 240;

const moods = {
  joy: {
    label: "Joy",
    color: "#F2C94C",
    phrases: ["looking forward", "so happy"],
    words: ["happy", "joyful", "delighted", "great", "excited", "cheerful", "proud", "wonderful", "thrilled"],
  },
  calm: {
    label: "Calm",
    color: "#78A889",
    phrases: ["at ease", "at peace"],
    words: ["calm", "peaceful", "relaxed", "content", "grounded", "okay", "steady", "rested"],
  },
  sadness: {
    label: "Sadness",
    color: "#4C78A8",
    phrases: ["feeling down", "let down", "miss them"],
    words: ["sad", "down", "blue", "low", "lonely", "disappointed", "heartbroken", "unhappy", "gloomy"],
  },
  anger: {
    label: "Anger",
    color: "#D95D4F",
    phrases: ["fed up", "ticked off"],
    words: ["angry", "mad", "furious", "irritated", "annoyed", "frustrated", "rage", "resentful"],
  },
  anxiety: {
    label: "Anxiety",
    color: "#8B6FB5",
    phrases: ["on edge", "freaking out", "worn thin"],
    words: ["anxious", "worried", "nervous", "uneasy", "overwhelmed", "stressed", "afraid", "panicked", "tense"],
  },
  tiredness: {
    label: "Tiredness",
    color: "#7C8491",
    phrases: ["burned out", "burnt out", "worn out", "running on empty"],
    words: ["tired", "exhausted", "drained", "sleepy", "weary", "fatigued", "spent"],
  },
  love: {
    label: "Love",
    color: "#D9829B",
    phrases: ["cared for", "close to"],
    words: ["loved", "loving", "affectionate", "grateful", "thankful", "connected", "tender", "cherished"],
  },
  hope: {
    label: "Hope",
    color: "#F2995B",
    phrases: ["can do this", "new beginning"],
    words: ["hopeful", "optimistic", "inspired", "encouraged", "curious", "motivated", "promising"],
  },
  boredom: {
    label: "Boredom",
    color: "#B79B72",
    phrases: ["nothing to do", "time is dragging"],
    words: ["bored", "boring", "unstimulated", "restless", "tedious"],
  },
  neutral: {
    label: "Neutral",
    color: "#AAA39A",
    phrases: ["not sure", "hard to say"],
    words: ["fine", "normal", "unsure", "numb", "indifferent", "mixed", "neutral", "meh"],
  },
};

let paletteOverrides = {};
let customMoodDefinitions = [];
loadMoodPreferences();

const intensityWords = new Set(["very", "really", "extremely", "incredibly", "so", "deeply"]);
const negationWords = new Set(["not", "never", "no", "isnt", "wasnt", "dont", "didnt", "hardly"]);

const elements = {
  form: document.querySelector("#mood-form"),
  input: document.querySelector("#mood-input"),
  paintButton: document.querySelector("#paint-button"),
  analysisLine: document.querySelector("#analysis-line"),
  suggestionSwatch: document.querySelector("#suggestion-swatch"),
  suggestionText: document.querySelector("#suggestion-text"),
  characterCount: document.querySelector("#character-count"),
  inputError: document.querySelector("#input-error"),
  paletteOptions: document.querySelector("#palette-options"),
  dotsLayer: document.querySelector("#dots-layer"),
  emptyCanvas: document.querySelector("#empty-canvas"),
  selectedDayLabel: document.querySelector("#selected-day-label"),
  canvasTitle: document.querySelector("#canvas-title"),
  entryDateLabel: document.querySelector("#entry-date-label"),
  momentsTitle: document.querySelector("#moments-title"),
  todayButton: document.querySelector("#today-button"),
  momentList: document.querySelector("#moment-list"),
  momentCount: document.querySelector("#moment-count"),
  momentTemplate: document.querySelector("#moment-template"),
  calendarTitle: document.querySelector("#calendar-title"),
  calendarGrid: document.querySelector("#calendar-grid"),
  previousMonth: document.querySelector("#previous-month"),
  nextMonth: document.querySelector("#next-month"),
  legendItems: document.querySelector("#legend-items"),
  paletteSettingsList: document.querySelector("#palette-settings-list"),
  customMoodForm: document.querySelector("#custom-mood-form"),
  customMoodTerm: document.querySelector("#custom-mood-term"),
  customMoodColor: document.querySelector("#custom-mood-color"),
  customMoodStatus: document.querySelector("#custom-mood-status"),
  customMoodList: document.querySelector("#custom-mood-list"),
  toast: document.querySelector("#toast"),
  toastMessage: document.querySelector("#toast-message"),
  undoButton: document.querySelector("#undo-button"),
};

const today = startOfDay(new Date());
let selectedDate = today;
let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let entries = readEntries();
let selectedMoodOverride = null;
let submissionLocked = false;
let toastTimer = null;
let undoTimer = null;
let pendingRemoval = null;

initialize();

function initialize() {
  buildPalette();
  buildLegend();
  buildMoodSettings();
  bindEvents();
  render();
}

function bindEvents() {
  elements.input.addEventListener("input", handleInput);
  elements.form.addEventListener("submit", handleSubmit);
  elements.previousMonth.addEventListener("click", () => changeMonth(-1));
  elements.nextMonth.addEventListener("click", () => changeMonth(1));
  elements.todayButton.addEventListener("click", selectToday);
  elements.undoButton.addEventListener("click", undoRemoval);
  elements.customMoodForm.addEventListener("submit", handleCustomMoodSubmit);
}

function buildPalette() {
  Object.entries(moods).forEach(([key, mood]) => {
    const button = document.createElement("button");
    button.className = "palette-option";
    button.type = "button";
    button.dataset.mood = key;
    button.innerHTML = `<span class="mood-swatch" style="--swatch: ${mood.color}"></span><span>${mood.label}</span>`;
    button.addEventListener("click", () => {
      selectedMoodOverride = key;
      updateSuggestion();
    });
    elements.paletteOptions.append(button);
  });
}

function buildLegend() {
  Object.values(moods).forEach((mood) => {
    const item = document.createElement("span");
    item.className = "legend-item";
    item.innerHTML = `<i class="legend-swatch" style="--swatch: ${mood.color}"></i>${mood.label}`;
    elements.legendItems.append(item);
  });
}

function buildMoodSettings() {
  Object.entries(moods).forEach(([key, mood]) => {
    const label = document.createElement("label");
    label.className = "palette-setting";

    const name = document.createElement("span");
    name.textContent = mood.label;

    const input = document.createElement("input");
    input.type = "color";
    input.value = mood.color;
    input.setAttribute("aria-label", `Choose a color for ${mood.label}`);
    input.addEventListener("change", () => updateMoodColor(key, input.value));

    label.append(name, input);
    elements.paletteSettingsList.append(label);
  });

  elements.customMoodList.replaceChildren();
  if (!customMoodDefinitions.length) return;

  const heading = document.createElement("p");
  heading.className = "custom-list-heading";
  heading.textContent = "Your custom moods";
  elements.customMoodList.append(heading);

  customMoodDefinitions.forEach((definition) => {
    const item = document.createElement("span");
    item.className = "custom-mood-chip";
    const swatch = document.createElement("i");
    swatch.style.setProperty("--swatch", moods[definition.key]?.color || definition.color);
    const text = document.createElement("span");
    text.textContent = definition.term;
    item.append(swatch, text);
    elements.customMoodList.append(item);
  });
}

function handleCustomMoodSubmit(event) {
  event.preventDefault();
  const term = normalizeCustomTerm(elements.customMoodTerm.value);
  if (!term) {
    elements.customMoodStatus.textContent = "Enter a word or short phrase first.";
    elements.customMoodTerm.focus();
    return;
  }

  const termExists = Object.values(moods).some((mood) =>
    [...mood.words, ...mood.phrases].includes(term),
  );
  if (termExists) {
    elements.customMoodStatus.textContent = `“${term}” is already in the mood vocabulary.`;
    return;
  }

  const key = `custom:${hashString(`${term}-${Date.now()}`).toString(16)}`;
  const definition = {
    key,
    term,
    label: titleCase(term),
    color: elements.customMoodColor.value.toUpperCase(),
  };
  customMoodDefinitions.push(definition);
  moods[key] = moodFromDefinition(definition);
  saveMoodPreferences();
  rebuildMoodControls();
  elements.customMoodForm.reset();
  elements.customMoodColor.value = "#6F8F72";
  elements.customMoodStatus.textContent = `${definition.label} was added to your palette.`;
}

function updateMoodColor(key, color) {
  if (!moods[key]) return;
  const normalizedColor = color.toUpperCase();
  moods[key].color = normalizedColor;
  paletteOverrides[key] = normalizedColor;
  entries = entries.map((entry) => {
    const moodComponents = Array.isArray(entry.moodComponents)
      ? entry.moodComponents.map((component) =>
          component.mood === key ? { ...component, color: normalizedColor } : component,
        )
      : entry.moodComponents;
    return {
      ...entry,
      ...(entry.selectedMood === key ? { color: normalizedColor } : {}),
      ...(moodComponents ? { moodComponents } : {}),
    };
  });
  saveMoodPreferences();
  saveEntries();
  rebuildMoodControls();
  render();
  updateSuggestion();
  showToast(`${moods[key].label} now uses ${normalizedColor}.`);
}

function rebuildMoodControls() {
  elements.paletteOptions.replaceChildren();
  elements.legendItems.replaceChildren();
  elements.paletteSettingsList.replaceChildren();
  buildPalette();
  buildLegend();
  buildMoodSettings();
}

function handleInput() {
  selectedMoodOverride = null;
  elements.inputError.textContent = "";
  elements.characterCount.textContent = `${elements.input.value.length} / ${MAX_ENTRY_LENGTH}`;
  updateSuggestion();
}

function handleSubmit(event) {
  event.preventDefault();
  if (submissionLocked) return;

  const text = elements.input.value.trim();
  if (!text) {
    elements.inputError.textContent = "Write a feeling or thought before painting.";
    elements.input.focus();
    return;
  }

  submissionLocked = true;
  elements.paintButton.disabled = true;

  const analysis = analyzeMood(text);
  const selectedMood = selectedMoodOverride || analysis.mood;
  const moodComponents = selectedMoodOverride
    ? [{
        mood: selectedMoodOverride,
        score: 1,
        color: moods[selectedMoodOverride].color,
        matchedTerms: analysis.components.find((component) => component.mood === selectedMoodOverride)?.matchedTerms || [],
      }]
    : analysis.components;
  const timestamp = new Date();
  const id = createId();
  entries.push({
    id,
    text,
    createdAt: timestamp.toISOString(),
    localDate: dateKey(selectedDate),
    suggestedMood: analysis.mood,
    selectedMood,
    color: moods[selectedMood].color,
    matchedTerms: analysis.matchedTerms,
    moodComponents,
    visualSeed: hashString(id),
  });

  saveEntries();
  elements.input.value = "";
  elements.characterCount.textContent = `0 / ${MAX_ENTRY_LENGTH}`;
  selectedMoodOverride = null;
  render();
  updateSuggestion();
  showToast("A moment was added to your canvas.");

  window.setTimeout(() => {
    submissionLocked = false;
    elements.paintButton.disabled = false;
    elements.input.focus();
  }, 350);
}

function analyzeMood(input) {
  const normalized = input
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const tokens = normalized.split(" ").filter(Boolean);
  const scores = Object.fromEntries(Object.keys(moods).map((key) => [key, 0]));
  const matches = Object.fromEntries(Object.keys(moods).map((key) => [key, []]));

  Object.entries(moods).forEach(([key, mood]) => {
    mood.phrases.forEach((phrase) => {
      const index = normalized.indexOf(phrase);
      if (index < 0) return;
      const preceding = normalized.slice(0, index).trim().split(" ").slice(-3);
      if (preceding.some((word) => negationWords.has(word))) return;
      scores[key] += 2;
      matches[key].push(phrase);
    });

    mood.words.forEach((word) => {
      tokens.forEach((token, index) => {
        if (token !== word) return;
        const preceding = tokens.slice(Math.max(0, index - 3), index);
        if (preceding.some((item) => negationWords.has(item))) return;
        const boosted = preceding.some((item) => intensityWords.has(item));
        scores[key] += boosted ? 1.5 : 1;
        matches[key].push(word);
      });
    });
  });

  const components = Object.keys(moods)
    .filter((key) => key !== "neutral" && scores[key] > 0)
    .map((key) => ({
      mood: key,
      score: scores[key],
      color: moods[key].color,
      matchedTerms: [...new Set(matches[key])],
    }))
    .sort((a, b) => b.score - a.score);

  if (!components.length) {
    components.push({
      mood: "neutral",
      score: Math.max(scores.neutral, 1),
      color: moods.neutral.color,
      matchedTerms: [...new Set(matches.neutral)],
    });
  }

  return {
    mood: components[0].mood,
    matchedTerms: [...new Set(components.flatMap((component) => component.matchedTerms))],
    components,
  };
}

function updateSuggestion() {
  const text = elements.input.value.trim();
  const analysis = analyzeMood(text);
  const components = selectedMoodOverride
    ? [{ mood: selectedMoodOverride, score: 1, color: moods[selectedMoodOverride].color, matchedTerms: [] }]
    : analysis.components;
  const label = getMoodLabel(components);

  elements.suggestionSwatch.style.setProperty("--swatch", buildMoodFill(components));
  if (!text) {
    elements.suggestionText.textContent = "Your suggested color will appear here.";
  } else if (selectedMoodOverride) {
    elements.suggestionText.textContent = `You chose ${label.toLowerCase()}.`;
  } else {
    elements.suggestionText.textContent = `${components.length > 1 ? "Suggested colors" : "Suggested color"}: ${label}.`;
  }

  document.querySelectorAll(".palette-option").forEach((button) => {
    const isSelected = selectedMoodOverride
      ? button.dataset.mood === selectedMoodOverride
      : components.length === 1 && button.dataset.mood === components[0].mood;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function getMoodComponents(entry) {
  if (Array.isArray(entry.moodComponents) && entry.moodComponents.length) {
    const validComponents = entry.moodComponents.filter((component) =>
      component && component.mood && component.color && Number(component.score) > 0,
    );
    if (validComponents.length) return validComponents;
  }

  const mood = moods[entry.selectedMood] || moods.neutral;
  return [{
    mood: entry.selectedMood || "neutral",
    score: 1,
    color: entry.color || mood.color,
    matchedTerms: Array.isArray(entry.matchedTerms) ? entry.matchedTerms : [],
  }];
}

function getMoodLabel(components) {
  return components
    .map((component) => moods[component.mood]?.label || "Mood")
    .join(" + ");
}

function buildMoodFill(components) {
  if (components.length <= 1) return components[0]?.color || moods.neutral.color;

  const minimumShare = Math.min(0.12, 1 / components.length);
  const availableShare = Math.max(0, 1 - minimumShare * components.length);
  const totalScore = components.reduce((total, component) => total + Number(component.score), 0) || 1;
  const shares = components.map((component) =>
    minimumShare + availableShare * (Number(component.score) / totalScore),
  );

  const stops = [];
  let position = 0;
  components.forEach((component, index) => {
    const end = position + shares[index] * 100;
    const transition = Math.min(5, shares[index] * 100 * 0.25);
    const color = component.color;
    if (index === 0) stops.push(`${color} 0%`);
    stops.push(`${color} ${Math.max(position, end - transition).toFixed(2)}%`);
    if (index < components.length - 1) {
      stops.push(`${components[index + 1].color} ${Math.min(100, end + transition).toFixed(2)}%`);
    }
    position = end;
  });
  stops.push(`${components.at(-1).color} 100%`);
  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

function render() {
  renderHeading();
  renderCanvas();
  renderMoments();
  renderCalendar();
}

function renderHeading() {
  const isToday = sameDay(selectedDate, today);
  const isCurrentMonth = sameMonth(displayedMonth, today);
  const shortDate = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(selectedDate);
  const monthName = new Intl.DateTimeFormat(undefined, { month: "long" }).format(displayedMonth);
  const monthAndYear = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(displayedMonth);

  elements.selectedDayLabel.textContent = `Painting ${monthAndYear}`;
  elements.canvasTitle.textContent = `${monthName}, in color.`;
  elements.entryDateLabel.textContent = isToday ? "Adding to today" : `Adding to ${shortDate}`;
  elements.todayButton.classList.toggle("is-visible", !isToday || !isCurrentMonth);
  elements.momentsTitle.textContent = isCurrentMonth ? "This month’s moments" : `${monthName}’s moments`;
}

function renderCanvas() {
  const monthEntries = getDisplayedMonthEntries();
  elements.dotsLayer.replaceChildren();
  elements.emptyCanvas.classList.toggle("is-hidden", monthEntries.length > 0);

  const positions = [];
  monthEntries.forEach((entry, index) => {
    const visual = makeVisual(entry, positions, index);
    const moodComponents = getMoodComponents(entry);
    const moodLabel = getMoodLabel(moodComponents);
    positions.push(visual);
    const dot = document.createElement("button");
    dot.className = "paint-dot";
    dot.type = "button";
    dot.dataset.entryId = entry.id;
    dot.style.left = `${visual.x}%`;
    dot.style.top = `${visual.y}%`;
    dot.style.setProperty("--dot-size", `${visual.size}px`);
    dot.style.setProperty("--dot-rotation", `${visual.rotation}deg`);
    dot.style.setProperty("--dot-color", buildMoodFill(moodComponents));
    dot.style.animationDelay = `${Math.min(index * 25, 250)}ms`;
    dot.setAttribute(
      "aria-label",
      `${moodComponents.length > 1 ? "Mixed " : ""}${moodLabel} entry on ${formatEntryDate(entry.localDate)}: ${entry.text}`,
    );
    dot.addEventListener("click", () => focusMoment(entry.id));
    elements.dotsLayer.append(dot);
  });
}

function makeVisual(entry, existing, index) {
  const random = mulberry32(Number(entry.visualSeed) || hashString(entry.id));
  let best = { x: 50, y: 50, distance: -1 };
  const candidateCount = Math.min(18, 7 + existing.length);

  for (let i = 0; i < candidateCount; i += 1) {
    const candidate = { x: 8 + random() * 84, y: 12 + random() * 76 };
    const distance = existing.length
      ? Math.min(...existing.map((point) => Math.hypot(candidate.x - point.x, candidate.y - point.y)))
      : 100;
    if (distance > best.distance) best = { ...candidate, distance };
  }

  return {
    x: best.x,
    y: best.y,
    size: 27 + Math.floor(random() * 22) + Math.min(index / 12, 5),
    rotation: Math.floor(random() * 56) - 28,
  };
}

function renderMoments() {
  const monthEntries = getDisplayedMonthEntries().sort((a, b) => {
    const dateComparison = b.localDate.localeCompare(a.localDate);
    return dateComparison || new Date(b.createdAt) - new Date(a.createdAt);
  });
  elements.momentList.replaceChildren();
  elements.momentCount.textContent = `${monthEntries.length} ${monthEntries.length === 1 ? "moment" : "moments"}`;

  monthEntries.forEach((entry) => {
    const fragment = elements.momentTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".moment-card");
    const dot = fragment.querySelector(".moment-dot");
    const text = fragment.querySelector(".moment-copy p");
    const meta = fragment.querySelector(".moment-copy span");
    const editForm = fragment.querySelector(".inline-edit-form");
    const editInput = fragment.querySelector(".inline-edit-input");
    const editError = fragment.querySelector(".inline-edit-error");
    const cancelEdit = fragment.querySelector(".inline-cancel-button");
    const edit = fragment.querySelector(".edit-button");
    const remove = fragment.querySelector(".delete-button");
    const moodComponents = getMoodComponents(entry);
    const moodLabel = getMoodLabel(moodComponents);

    card.dataset.entryId = entry.id;
    dot.style.setProperty("--swatch", buildMoodFill(moodComponents));
    dot.setAttribute("aria-label", `Show ${moodLabel.toLowerCase()} dot on canvas`);
    dot.addEventListener("click", () => focusDot(entry.id));
    text.textContent = entry.text;
    meta.textContent = `${moodLabel} · ${formatEntryDate(entry.localDate, true)} · ${formatTime(entry.createdAt)}`;
    edit.setAttribute("aria-label", `Edit entry: ${entry.text}`);
    edit.addEventListener("click", () => startInlineEditing(card, editInput, entry));
    editForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveInlineEdit(entry.id, editInput.value, editError);
    });
    cancelEdit.addEventListener("click", () => cancelInlineEditing(card));
    remove.setAttribute("aria-label", `Remove entry: ${entry.text}`);
    remove.addEventListener("click", () => removeEntry(entry.id));
    elements.momentList.append(fragment);
  });
}

function renderCalendar() {
  elements.calendarTitle.textContent = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(displayedMonth);
  elements.calendarGrid.replaceChildren();

  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    const key = dateKey(date);
    const dayEntries = entries.filter((entry) => entry.localDate === key);
    const button = document.createElement("button");
    button.className = "calendar-day";
    button.type = "button";
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", calendarAriaLabel(date, dayEntries.length));
    button.textContent = date.getDate();
    button.classList.toggle("is-outside", date.getMonth() !== month);
    button.classList.toggle("is-selected", sameDay(date, selectedDate));
    button.classList.toggle("is-today", sameDay(date, today));
    button.setAttribute("aria-selected", String(sameDay(date, selectedDate)));

    if (dayEntries.length) {
      const miniDots = document.createElement("span");
      miniDots.className = "mini-dots";
      dayEntries.slice(0, 4).forEach((entry) => {
        const dot = document.createElement("i");
        dot.style.setProperty("--mini-color", buildMoodFill(getMoodComponents(entry)));
        miniDots.append(dot);
      });
      button.append(miniDots);
    }

    button.addEventListener("click", () => selectDate(date));
    elements.calendarGrid.append(button);
  }
}

function selectDate(date) {
  selectedDate = startOfDay(date);
  displayedMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  render();
  elements.canvasTitle.scrollIntoView({ behavior: "smooth", block: "start" });
}

function selectToday() {
  selectedDate = today;
  displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  render();
}

function changeMonth(offset) {
  displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + offset, 1);
  selectedDate = sameMonth(displayedMonth, today)
    ? today
    : new Date(displayedMonth.getFullYear(), displayedMonth.getMonth(), 1);
  render();
}

function focusMoment(id) {
  document.querySelector(`.moment-card[data-entry-id="${CSS.escape(id)}"]`)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  focusDot(id);
}

function focusDot(id) {
  document.querySelectorAll(".paint-dot").forEach((dot) => {
    dot.classList.toggle("is-highlighted", dot.dataset.entryId === id);
  });
  window.setTimeout(() => {
    document.querySelector(`.paint-dot[data-entry-id="${CSS.escape(id)}"]`)?.classList.remove("is-highlighted");
  }, 1600);
}

function startInlineEditing(card, input, entry) {
  document.querySelectorAll(".moment-card.is-editing").forEach((openCard) => {
    openCard.classList.remove("is-editing");
  });
  input.value = entry.text;
  card.classList.add("is-editing");
  input.focus();
  input.select();
}

function cancelInlineEditing(card) {
  card.classList.remove("is-editing");
}

function saveInlineEdit(id, value, errorElement) {
  const text = value.trim();
  if (!text) {
    errorElement.textContent = "A moment cannot be blank.";
    return;
  }

  const index = entries.findIndex((entry) => entry.id === id);
  if (index < 0) return;
  const analysis = analyzeMood(text);
  entries[index] = {
    ...entries[index],
    text,
    suggestedMood: analysis.mood,
    matchedTerms: analysis.matchedTerms,
    updatedAt: new Date().toISOString(),
  };
  saveEntries();
  render();
  showToast("Your moment was updated.");
}

function removeEntry(id) {
  const index = entries.findIndex((item) => item.id === id);
  if (index < 0) return;
  const confirmed = window.confirm("Remove this moment from the canvas? You’ll have 3 seconds to undo.");
  if (!confirmed) return;

  window.clearTimeout(undoTimer);
  const [entry] = entries.splice(index, 1);
  pendingRemoval = { entry, index };
  saveEntries();
  render();
  showUndoToast();
}

function showUndoToast() {
  window.clearTimeout(toastTimer);
  window.clearTimeout(undoTimer);
  elements.toastMessage.textContent = "The moment was removed.";
  elements.undoButton.hidden = false;
  elements.toast.classList.add("is-visible");

  undoTimer = window.setTimeout(() => {
    pendingRemoval = null;
    elements.undoButton.hidden = true;
    elements.toast.classList.remove("is-visible");
  }, 3000);
}

function undoRemoval() {
  if (!pendingRemoval) return;

  window.clearTimeout(undoTimer);
  const { entry, index } = pendingRemoval;
  entries.splice(Math.min(index, entries.length), 0, entry);
  pendingRemoval = null;
  saveEntries();
  render();
  showToast("Your moment was restored.");
}

function getDisplayedMonthEntries() {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth() + 1;
  return entries.filter((entry) => {
    const [entryYear, entryMonth] = entry.localDate.split("-").map(Number);
    return entryYear === year && entryMonth === month;
  });
}

function loadMoodPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(MOOD_PREFERENCES_KEY) || "{}");
    paletteOverrides = saved.palette && typeof saved.palette === "object" ? saved.palette : {};
    customMoodDefinitions = Array.isArray(saved.customMoods) ? saved.customMoods : [];

    customMoodDefinitions.forEach((definition) => {
      if (definition?.key && definition?.term && definition?.color) {
        moods[definition.key] = moodFromDefinition(definition);
      }
    });
    Object.entries(paletteOverrides).forEach(([key, color]) => {
      if (moods[key] && /^#[0-9A-F]{6}$/i.test(color)) moods[key].color = color.toUpperCase();
    });
  } catch (error) {
    console.warn("Daily Canvas could not read mood preferences.", error);
    paletteOverrides = {};
    customMoodDefinitions = [];
  }
}

function saveMoodPreferences() {
  try {
    localStorage.setItem(MOOD_PREFERENCES_KEY, JSON.stringify({
      palette: paletteOverrides,
      customMoods: customMoodDefinitions,
    }));
  } catch (error) {
    console.warn("Daily Canvas could not save mood preferences.", error);
    showToast("This browser could not save your palette.");
  }
}

function moodFromDefinition(definition) {
  const isPhrase = definition.term.includes(" ");
  return {
    label: definition.label,
    color: definition.color,
    phrases: isPhrase ? [definition.term] : [],
    words: isPhrase ? [] : [definition.term],
  };
}

function normalizeCustomTerm(value) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readEntries() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(isValidEntry) : [];
  } catch (error) {
    console.warn("Daily Canvas could not read saved entries.", error);
    return [];
  }
}

function isValidEntry(entry) {
  return Boolean(entry && entry.id && entry.text && entry.localDate && entry.selectedMood);
}

function saveEntries() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Daily Canvas could not save entries.", error);
    showToast("This browser could not save your moment.");
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  window.clearTimeout(undoTimer);
  pendingRemoval = null;
  elements.toastMessage.textContent = message;
  elements.undoButton.hidden = true;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2500);
}

function calendarAriaLabel(date, count) {
  const label = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(date);
  return `${label}, ${count} ${count === 1 ? "moment" : "moments"}`;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(timestamp));
}

function formatEntryDate(key, short = false) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(undefined, short
    ? { month: "short", day: "numeric" }
    : { month: "long", day: "numeric" }
  ).format(date);
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a, b) {
  return dateKey(a) === dateKey(b);
}

function sameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
