const textSets = {
  easy: [
    "Small steps every day can create big changes over time. Keep your focus, stay patient, and enjoy the process.",
    "Practice makes progress. Type each word carefully and let your speed improve naturally with consistent effort.",
    "The best way to get better at typing is to practice regularly without rushing. Accuracy comes first, then speed."
  ],
  medium: [
    "Modern technology moves quickly, but great ideas still need patience, creativity, and careful attention to detail.",
    "A developer solves problems one step at a time. Clear thinking, useful practice, and persistence make difficult tasks easier.",
    "Learning to type faster is not about pressing keys as quickly as possible. It is about building a reliable rhythm."
  ],
  hard: [
    "Exceptional developers understand that productivity is more than raw speed; it is the ability to remain accurate while solving increasingly complex problems.",
    "When distractions disappear, focused practice becomes surprisingly powerful. Consistent repetition transforms unfamiliar movements into automatic habits.",
    "Software is built through thousands of small decisions, and strong fundamentals make those decisions faster, clearer, and considerably more reliable."
  ]
};

let selectedTime = 30;
let difficulty = "easy";
let text = "";
let started = false;
let finished = false;
let startTime = 0;
let timerId = null;
let typed = "";

const quote = document.querySelector("#quote");
const input = document.querySelector("#input");
const timer = document.querySelector("#timer");
const statusText = document.querySelector("#statusText");
const wpmEl = document.querySelector("#wpm");
const accuracyEl = document.querySelector("#accuracy");
const charsEl = document.querySelector("#characters");
const errorsEl = document.querySelector("#errors");
const result = document.querySelector("#result");
const resultTitle = document.querySelector("#resultTitle");
const resultText = document.querySelector("#resultText");

function chooseText() {
  const list = textSets[difficulty];
  text = list[Math.floor(Math.random() * list.length)];
}

function renderText() {
  quote.innerHTML = "";
  [...text].forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char;
    if (i === 0) span.classList.add("current");
    quote.appendChild(span);
  });
}

function reset() {
  clearInterval(timerId);
  started = false;
  finished = false;
  startTime = 0;
  typed = "";
  timer.textContent = selectedTime;
  statusText.textContent = "Ready";
  document.body.classList.remove("typing");
  input.value = "";
  result.classList.remove("show");
  chooseText();
  renderText();
  updateStats();
}

function start() {
  if (started || finished) return;
  started = true;
  startTime = Date.now();
  statusText.textContent = "Typing";
  document.body.classList.add("typing");
  timerId = setInterval(tick, 100);
}

function tick() {
  const elapsed = (Date.now() - startTime) / 1000;
  const remaining = Math.max(0, selectedTime - elapsed);
  timer.textContent = Math.ceil(remaining);
  updateStats();
  if (remaining <= 0) finish();
}

function finish() {
  if (finished) return;
  finished = true;
  started = false;
  clearInterval(timerId);
  input.blur();
  statusText.textContent = "Finished";
  document.body.classList.remove("typing");
  updateStats();
  const wpm = Number(wpmEl.textContent);
  resultTitle.textContent = wpm >= 60 ? "Excellent run." : wpm >= 40 ? "Nice run." : "Good start.";
  resultText.textContent = `You typed at ${wpm} WPM with ${accuracyEl.textContent} accuracy.`;
  result.classList.add("show");
}

function updateStats() {
  const value = input.value;
  const elapsed = started ? Math.max((Date.now() - startTime) / 1000, 1) : (finished ? selectedTime : 0);
  let errors = 0;

  [...value].forEach((char, i) => {
    if (char !== text[i]) errors++;
  });

  const correct = Math.max(0, value.length - errors);
  const accuracy = value.length ? Math.round((correct / value.length) * 100) : 100;
  const minutes = elapsed / 60;
  const wpm = minutes ? Math.round((correct / 5) / minutes) : 0;

  wpmEl.textContent = wpm;
  accuracyEl.textContent = `${accuracy}%`;
  charsEl.textContent = value.length;
  errorsEl.textContent = errors;

  [...quote.children].forEach((span, i) => {
    span.className = "";
    if (i < value.length) {
      span.classList.add(value[i] === text[i] ? "correct" : "wrong");
    }
    if (i === value.length && value.length < text.length) span.classList.add("current");
  });
}

input.addEventListener("input", () => {
  if (finished) return;
  if (!started && input.value.length) start();

  typed = input.value;
  if (typed.length >= text.length) {
    // Give the user a new line instead of blocking input.
    chooseText();
    input.value = "";
    renderText();
  }
  updateStats();
});

document.querySelector("#quoteWrap").addEventListener("click", () => input.focus());
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    if (e.shiftKey) return;
    const enter = new KeyboardEvent("keydown", { key: "Enter" });
    window.setTimeout(() => {
      if (document.activeElement !== input) input.focus();
    }, 0);
  }
  if (e.key === "Enter" && e.ctrlKey) reset();
});

document.querySelectorAll("#timeOptions .option").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedTime = Number(btn.dataset.time);
    document.querySelectorAll("#timeOptions .option").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    reset();
  });
});

document.querySelectorAll("#difficultyOptions .option").forEach(btn => {
  btn.addEventListener("click", () => {
    difficulty = btn.dataset.difficulty;
    document.querySelectorAll("#difficultyOptions .option").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    reset();
  });
});

document.querySelector("#restartBtn").addEventListener("click", reset);
document.querySelector("#resultRestart").addEventListener("click", () => {
  reset();
  input.focus();
});

document.querySelector("#themeBtn").addEventListener("click", () => {
  const dark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = dark ? "light" : "dark";
  document.querySelector("#themeBtn").textContent = dark ? "☾" : "☀";
  localStorage.setItem("typeflow-theme", dark ? "light" : "dark");
});

const savedTheme = localStorage.getItem("typeflow-theme");
if (savedTheme === "dark") {
  document.documentElement.dataset.theme = "dark";
  document.querySelector("#themeBtn").textContent = "☀";
}

reset();
