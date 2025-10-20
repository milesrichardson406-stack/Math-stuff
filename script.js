const CODES = {
  "DOOM3-D3WASM": {
    name: "DOOM 3",
    action: "https://milesrichardson406-stack.github.io/games/doom3/index.html"
  },
  "MOTHER3-M3WASM": {
    name: "MOTHER 3",
    action: "https://milesrichardson406-stack.github.io/games/mother3/index.html"
  }
};

const QUESTIONS = [
  // Format: {q: "Question text", a: numericAnswer}
  { q: "1) Solve for x: 2x - 5 = 9", a: 7 },
  { q: "2) Evaluate: 3^3 + 4", a: 31 },
  { q: "3) Solve for x: x^2 - 4 = 0 (positive root)", a: 2 },
  { q: "4) Evaluate derivative: d/dx (x^2) at x = 5", a: 10 },
  { q: "5) Evaluate derivative: d/dx (3x^3) at x=2", a: 36 },
  { q: "6) Evaluate: 7 * 8 - 10", a: 46 },
  { q: "7) Solve for x: 5x = 45", a: 9 },
  { q: "8) Evaluate integral: ∫_0^1 2x dx (definite)", a: 1 },
  { q: "9) Simplify: (x^2 * x^3) at x=1", a: 1 },
  { q: "10) Evaluate: 12 / 4 + 3", a: 6 },
  { q: "11) Solve: x - 3 = 2", a: 5 },
  { q: "12) Evaluate: 2^(4) - 1", a: 15 },
  { q: "13) Solve quadratic: x^2 - 6x + 9 = 0 (root)", a: 3 },
  { q: "14) Evaluate derivative: d/dx (sin x) at x=0 (use radians)", a: 1 },
  { q: "15) Evaluate: 100 - 45", a: 55 },
  { q: "16) Solve: 4x + 2 = 18", a: 4 },
  { q: "17) Evaluate: sqrt(81)", a: 9 },
  { q: "18) Evaluate integral: ∫_0^2 3 dx", a: 6 },
  { q: "19) Simplify: (6*7) / 3", a: 14 },
  { q: "20) Evaluate derivative: d/dx (5x) at x=10", a: 5 },
  { q: "21) Evaluate: 9 * 9", a: 81 },
  { q: "22) Solve: 2x + 3 = 11", a: 4 },
  { q: "23) Evaluate: floor(7.9)", a: 7 }, // expects 7
  { q: "24) Evaluate: 0! (factorial)", a: 1 },
  { q: "25) Solve for x: x/2 = 7", a: 14 },
  { q: "26) Evaluate: 3*3*3", a: 27 },
  { q: "27) Evaluate integral: ∫_1^2 x dx", a: 1.5 },
  { q: "28) Solve: 10 - 3x = 1", a: 3 },
  { q: "29) Evaluate: 2^5", a: 32 },
  { q: "30) Evaluate derivative: d/dx (x^3) at x=1", a: 3 }
];

// Codes mapping (entered into the answer box)
// NOTE: These codes DO NOT embed copyrighted content here.
// They simply trigger the about:blank navigation per your instructions.
// If you host the game files legally, replace the about:blank navigation with opening your hosted URL.

// UI elements
const startBtn = document.getElementById('start-btn');
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const finishScreen = document.getElementById('finish-screen');
const questionText = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const skipBtn = document.getElementById('skip-btn');
const feedback = document.getElementById('feedback');
const progress = document.getElementById('progress');
const timerEl = document.getElementById('timer');
const finalTime = document.getElementById('final-time');
const restartBtn = document.getElementById('restart-btn');

let current = 0;
let startTime = 0;
let running = false;
let timerInterval = null;

function formatTime(ms) {
  // Returns seconds.milliseconds with 3 fractional digits, e.g., "12.345 s"
  const seconds = (ms / 1000);
  return seconds.toFixed(3) + " s";
}

function startTimer(){
  startTime = performance.now();
  running = true;
  timerInterval = setInterval(() => {
    const now = performance.now();
    timerEl.textContent = formatTime(now - startTime);
  }, 50);
}

function stopTimer(){
  running = false;
  if (timerInterval) clearInterval(timerInterval);
}

function showQuestion(i) {
  current = i;
  const q = QUESTIONS[i];
  questionText.textContent = q.q;
  answerInput.value = "";
  answerInput.focus();
  progress.textContent = `Question ${i+1} / ${QUESTIONS.length}`;
  feedback.textContent = "";
}

function checkSpecialCodeInput(text) {
  const code = text.trim();
  if (code in CODES) {
    // Per your rule: Replace the site with an about:blank page.
    // This immediately navigates away and stops scripts.
    window.location.href = CODES[code].action;
    return true;
  }
  return false;
}

function submitAnswer(){
  const raw = answerInput.value.trim();
  if (raw === "") {
    feedback.textContent = "Wrong, try again";
    return;
  }

  // If the input matches a special code, perform code action (navigates away)
  if (checkSpecialCodeInput(raw)) return;

  // Otherwise evaluate as numeric answer
  // Accept numeric values. Try to parse as number.
  const parsed = Number(raw);
  const correct = QUESTIONS[current].a;

  // If parsed is not a number, it's wrong
  if (isNaN(parsed)) {
    feedback.textContent = "Wrong, try again";
    return;
  }

  // Use tolerance for floating comparisons
  const EPS = 1e-6;
  if (Math.abs(parsed - correct) <= EPS) {
    // Correct
    const next = current + 1;
    if (next >= QUESTIONS.length) {
      // Finished
      stopTimer();
      quizScreen.classList.add('hidden');
      finishScreen.classList.remove('hidden');
      const elapsed = performance.now() - startTime;
      finalTime.textContent = formatTime(elapsed);
    } else {
      showQuestion(next);
    }
  } else {
    feedback.textContent = "Wrong, try again";
  }
}

submitBtn.addEventListener('click', submitAnswer);
answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    submitAnswer();
  }
});

// skip / show answer button reveals correct answer (useful for study)
skipBtn.addEventListener('click', () => {
  const correct = QUESTIONS[current].a;
  feedback.style.color = 'var(--muted)';
  feedback.textContent = `Answer: ${correct}`;
  setTimeout(() => {
    feedback.style.color = '';
    // advance to next
    const next = current + 1;
    if (next >= QUESTIONS.length) {
      stopTimer();
      quizScreen.classList.add('hidden');
      finishScreen.classList.remove('hidden');
      const elapsed = performance.now() - startTime;
      finalTime.textContent = formatTime(elapsed);
    } else {
      showQuestion(next);
    }
  }, 800);
});

restartBtn.addEventListener('click', () => {
  finishScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  // reset
  current = 0;
  feedback.textContent = "";
  timerEl.textContent = "0.000 s";
});
