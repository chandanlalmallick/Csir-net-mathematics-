/**
 * CSIR-NET MATHEMATICAL SCIENCES — 5 FULL-LENGTH MOCK SIMULATOR
 */

const EXAM_CONFIG = {
  durationSeconds: 180 * 60,
  totalQuestions: 130,
  maxAttempts: 60,
  rules: {
    A: { count: 20, maxAttempt: 15, correct: 2.0, negative: 0.50, isMSQ: false },
    B: { count: 40, maxAttempt: 25, correct: 3.0, negative: 0.75, isMSQ: false },
    C: { count: 70, maxAttempt: 20, correct: 4.0, negative: 0.00, isMSQ: true }
  }
};

const STORAGE_KEYS = {
  ACTIVE_MOCK: "csir_active_mock",
  ANSWERS: "csir_answers",
  MARKED: "csir_marked",
  VISITED: "csir_visited",
  CURRENT_Q: "csir_current_q",
  TIME_LEFT: "csir_remaining_time",
  IS_STARTED: "csir_test_started"
};

let state = {
  selectedMock: 1,
  currentQuestionIndex: 0,
  answers: {},
  marked: new Set(),
  visited: new Set(),
  remainingSeconds: EXAM_CONFIG.durationSeconds,
  timerInterval: null,
  activePaletteTab: "A"
};

const CSIR_BANK_BLUEPRINT = {
  partA: [
    {
      topic: "Quantitative Aptitude",
      q: (n) => `A train running at $72\\text{ km/h}$ passes a platform of length ${200 + n * 10}\\text{ m}$ in ${25 + (n % 5)}\\text{ s}$. Find the length of the train.`,
      opts: (n) => ({
        A: `${300 + n * 5}\\text{ m}`,
        B: `${280 + n * 5}\\text{ m}`,
        C: `${320 + n * 5}\\text{ m}`,
        D: `${260 + n * 5}\\text{ m}`
      }),
      ans: "A",
      exp: (n) => `Speed $= 72 \\times \\frac{5}{18} = 20\\text{ m/s}$. Distance $= 20 \\times (${25 + (n % 5)})$. Train length $= \\text{Distance} - (${200 + n * 10})$.`
    },
    {
      topic: "Combinatorics & Probability",
      q: (n) => `Three cards are drawn from a pack of $52$ cards. What is the probability that all three are aces?`,
      opts: () => ({
        A: `$\\frac{1}{5525}$`,
        B: `$\\frac{3}{5525}$`,
        C: `$\\frac{1}{221}$`,
        D: `$\\frac{4}{5525}$`
      }),
      ans: "A",
      exp: () => `Probability $= \\frac{\\binom{4}{3}}{\\binom{52}{3}} = \\frac{4}{22100} = \\frac{1}{5525}$.`
    },
    {
      topic: "Logical Reasoning",
      q: (n) => `Find the next number in the sequence: $2, ${5 + n}, ${10 + 2 * n}, ${17 + 3 * n}, \\dots$`,
      opts: (n) => ({
        A: `${26 + 4 * n}`,
        B: `${25 + 4 * n}`,
        C: `${27 + 4 * n}`,
        D: `${24 + 3 * n}`
      }),
      ans: "A",
      exp: (n) => `Formula is $T_k = k^2 + 1 + (k - 1)n$. For $k=5$, $T_5 = 26 + 4n$.`
    }
  ],
  partB: [
    {
      topic: "Linear Algebra",
      q: () => `Let $A$ be an $n \\times n$ real matrix such that $A^2 = A$. Which of the following statements is ALWAYS true?`,
      opts: () => ({
        A: "The only possible eigenvalues of $A$ are $0$ and $1$, and $A$ is diagonalizable.",
        B: "$A$ must be an invertible matrix.",
        C: "$\\text{trace}(A) = 0$.",
        D: "The minimal polynomial of $A$ has degree $\\ge 3$."
      }),
      ans: "A",
      exp: () => `Since $A(A-I) = 0$, minimal polynomial divides $x(x-1)$, which has non-repeated linear roots.`
    },
    {
      topic: "Real Analysis",
      q: () => `Let $f: [0,1] \\to \\mathbb{R}$ be continuous with $\\int_0^1 f(x) x^k \\, dx = 0$ for all $k \\ge 0$. Then:`,
      opts: () => ({
        A: "$f(x) = 0$ for all $x \\in [0,1]$.",
        B: "$f(x) \\ge 1$ for all $x$.",
        C: "$f$ must be non-differentiable.",
        D: "$f(x) = \\cos(\\pi x)$."
      }),
      ans: "A",
      exp: () => `By Weierstrass approximation theorem, polynomials are dense in $C[0,1]$. Hence $f \\equiv 0$.`
    },
    {
      topic: "Abstract Algebra",
      q: () => `Every group of order $35$ is:`,
      opts: () => ({
        A: "Cyclic",
        B: "Non-abelian",
        C: "Simple",
        D: "Infinite"
      }),
      ans: "A",
      exp: () => `Order is $35 = 5 \\times 7$. Since $5$ does not divide $(7 - 1)$, the group is unique and cyclic.`
    },
    {
      topic: "Complex Analysis",
      q: () => `The residue of $f(z) = \\frac{e^z - 1}{z^2}$ at $z = 0$ is:`,
      opts: () => ({
        A: "$1$",
        B: "$0$",
        C: "$\\frac{1}{2}$",
        D: "$-1$"
      }),
      ans: "A",
      exp: () => `$\\frac{e^z - 1}{z^2} = \\frac{1}{z} + \\frac{1}{2!} + \\frac{z}{3!} + \\dots$. Residue is coefficient of $1/z$, which is $1$.`
    }
  ],
  partC: [
    {
      topic: "Real Analysis",
      q: () => `Let $f_n(x) = \\frac{nx}{1 + n^2 x^2}$ for $x \\in [0,1]$. Which of the following statements are true?`,
      opts: () => ({
        A: "$f_n(x) \\to 0$ pointwise on $[0,1]$.",
        B: "$f_n$ does NOT converge uniformly on $[0,1]$.",
        C: "$\\lim_{n\\to\\infty}\\int_0^1 f_n(x)\\,dx = 0$.",
        D: "The sequence $(f_n)$ is uniformly bounded on $[0,1]$."
      }),
      ans: ["A", "B", "C", "D"],
      exp: () => `Maximum value is $f_n(1/n) = 1/2$, preventing uniform convergence to 0, though pointwise limit and integral limit are 0.`
    },
    {
      topic: "Linear Algebra",
      q: () => `Let $T: V \\to V$ be a skew-adjoint operator ($T^* = -T$) on a finite-dimensional complex inner product space. Which of the following are ALWAYS true?`,
      opts: () => ({
        A: "All eigenvalues of $T$ are purely imaginary or zero.",
        B: "$T$ is unitarily diagonalizable.",
        C: "$I + T$ is invertible.",
        D: "$\\det(e^T) \\neq 0$."
      }),
      ans: ["A", "B", "C", "D"],
      exp: () => `Skew-adjoint operators are normal ($T^*T = TT^*$), so unitarily diagonalizable, with pure imaginary eigenvalues.`
    }
  ]
};

function generateMockQuestions(mockNumber) {
  const questions = [];
  const m = mockNumber;

  for (let i = 1; i <= 20; i++) {
    const t = CSIR_BANK_BLUEPRINT.partA[(i + m) % CSIR_BANK_BLUEPRINT.partA.length];
    questions.push({
      id: `M${m}-A-${i}`,
      number: i,
      section: "A",
      topic: t.topic,
      difficulty: "Moderate",
      question: t.q(i + m),
      options: t.opts(i + m),
      correctAnswer: t.ans,
      explanation: t.exp(i + m)
    });
  }

  for (let i = 21; i <= 60; i++) {
    const t = CSIR_BANK_BLUEPRINT.partB[(i + m) % CSIR_BANK_BLUEPRINT.partB.length];
    questions.push({
      id: `M${m}-B-${i}`,
      number: i,
      section: "B",
      topic: t.topic,
      difficulty: "CSIR Standard",
      question: t.q(i + m),
      options: t.opts(i + m),
      correctAnswer: t.ans,
      explanation: t.exp(i + m)
    });
  }

  for (let i = 61; i <= 130; i++) {
    const t = CSIR_BANK_BLUEPRINT.partC[(i + m) % CSIR_BANK_BLUEPRINT.partC.length];
    questions.push({
      id: `M${m}-C-${i}`,
      number: i,
      section: "C",
      topic: t.topic,
      difficulty: "Hard (MSQ)",
      question: t.q(i + m),
      options: t.opts(i + m),
      correctAnswer: t.ans,
      explanation: t.exp(i + m)
    });
  }

  return questions;
}

let activeQuestionBank = [];

function initDashboard() {
  const grid = document.getElementById("mock-grid");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const card = document.createElement("div");
    card.className = "mock-card";
    card.innerHTML = `
      <div>
        <h3>MOCK TEST ${i}</h3>
        <div class="mock-meta">
          <p><strong>130 Questions</strong></p>
          <p>180 Minutes &bull; Max 60 Attempts</p>
        </div>
      </div>
      <button class="btn btn-primary" onclick="showInstructions(${i})">START TEST</button>
    `;
    grid.appendChild(card);
  }
}

window.showInstructions = function(mockIndex) {
  state.selectedMock = mockIndex;
  const instTitle = document.getElementById("inst-mock-title");
  if (instTitle) instTitle.innerText = `MOCK TEST ${mockIndex} — INSTRUCTIONS`;
  switchView("view-instructions");
};

window.startExam = function() {
  activeQuestionBank = generateMockQuestions(state.selectedMock);
  state.currentQuestionIndex = 0;
  state.answers = {};
  state.marked.clear();
  state.visited.clear();
  state.visited.add(0);
  state.remainingSeconds = EXAM_CONFIG.durationSeconds;

  localStorage.setItem(STORAGE_KEYS.ACTIVE_MOCK, state.selectedMock);
  localStorage.setItem(STORAGE_KEYS.IS_STARTED, "true");
  saveExamState();

  switchView("view-exam");
  initPalette();
  renderCurrentQuestion();
  updateStatusStrip();
  startTimer();
};

function switchView(viewId) {
  ["view-dashboard", "view-instructions", "view-exam", "view-result"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("hidden");
  });
  const target = document.getElementById(viewId);
  if (target) target.classList.remove("hidden");

  const headerTimer = document.getElementById("header-timer-container");
  if (headerTimer) {
    if (viewId === "view-exam") headerTimer.classList.remove("hidden");
    else headerTimer.classList.add("hidden");
  }
}

function getSectionAttemptCount(sec) {
  let count = 0;
  activeQuestionBank.forEach((q, idx) => {
    if (q.section === sec && state.answers[idx] !== undefined) {
      const a = state.answers[idx];
      if (Array.isArray(a) ? a.length > 0 : a !== null) count++;
    }
  });
  return count;
}

function updateStatusStrip() {
  const cA = getSectionAttemptCount("A");
  const cB = getSectionAttemptCount("B");
  const cC = getSectionAttemptCount("C");
  const tot = cA + cB + cC;

  const elA = document.getElementById("stat-part-a");
  const elB = document.getElementById("stat-part-b");
  const elC = document.getElementById("stat-part-c");
  const elT = document.getElementById("stat-total");

  if (elA) elA.innerText = `${cA} / ${EXAM_CONFIG.rules.A.maxAttempt}`;
  if (elB) elB.innerText = `${cB} / ${EXAM_CONFIG.rules.B.maxAttempt}`;
  if (elC) elC.innerText = `${cC} / ${EXAM_CONFIG.rules.C.maxAttempt}`;
  if (elT) elT.innerText = `${tot} / ${EXAM_CONFIG.maxAttempts}`;
}

function renderCurrentQuestion() {
  const q = activeQuestionBank[state.currentQuestionIndex];
  if (!q) return;
  state.visited.add(state.currentQuestionIndex);

  document.getElementById("q-section-badge").innerText = `PART ${q.section}`;
  document.getElementById("q-header-number").innerText = `Question ${q.number} / ${EXAM_CONFIG.totalQuestions}`;
  document.getElementById("q-topic-tag").innerText = q.topic;

  const rule = EXAM_CONFIG.rules[q.section];
  document.getElementById("q-marks-tag").innerText = `+${rule.correct} / -${rule.negative}`;
  document.getElementById("q-content").innerHTML = q.question;

  const optCont = document.getElementById("q-options");
  optCont.innerHTML = "";

  const isMSQ = rule.isMSQ;
  const userAns = state.answers[state.currentQuestionIndex];

  ["A", "B", "C", "D"].forEach(k => {
    const label = document.createElement("label");
    label.className = "option-item";

    const input = document.createElement("input");
    input.type = isMSQ ? "checkbox" : "radio";
    input.name = "question_option";
    input.value = k;

    if (isMSQ) {
      if (Array.isArray(userAns) && userAns.includes(k)) input.checked = true;
    } else {
      if (userAns === k) input.checked = true;
    }

    input.onchange = () => handleOptionSelection(k, isMSQ);

    const txt = document.createElement("span");
    txt.className = "option-label-text";
    txt.innerHTML = `<strong>(${k})</strong> ${q.options[k]}`;

    label.appendChild(input);
    label.appendChild(txt);
    optCont.appendChild(label);
  });

  updatePaletteButton(state.currentQuestionIndex);
  updateStatusStrip();
  saveExamState();

  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise();
  }
}

function handleOptionSelection(k, isMSQ) {
  const q = activeQuestionBank[state.currentQuestionIndex];
  const maxSec = EXAM_CONFIG.rules[q.section].maxAttempt;
  const currentCount = getSectionAttemptCount(q.section);
  const alreadyAnswered = state.answers[state.currentQuestionIndex] !== undefined;

  if (!alreadyAnswered && currentCount >= maxSec) {
    alert(`Attempt limit reached for Part ${q.section} (Max: ${maxSec})`);
    renderCurrentQuestion();
    return;
  }

  if (isMSQ) {
    let arr = state.answers[state.currentQuestionIndex] || [];
    if (!Array.isArray(arr)) arr = [];
    if (arr.includes(k)) arr = arr.filter(x => x !== k);
    else arr.push(k);

    if (arr.length === 0) delete state.answers[state.currentQuestionIndex];
    else state.answers[state.currentQuestionIndex] = arr;
  } else {
    state.answers[state.currentQuestionIndex] = k;
  }

  updatePaletteButton(state.currentQuestionIndex);
  updateStatusStrip();
  saveExamState();
}

function initPalette() {
  const grid = document.getElementById("palette-buttons-grid");
  if (!grid) return;
  grid.innerHTML = "";

  activeQuestionBank.forEach((q, idx) => {
    const btn = document.createElement("button");
    btn.className = "pal-btn not-visited";
    btn.id = `pal-btn-${idx}`;
    btn.innerText = q.number;
    btn.onclick = () => {
      state.currentQuestionIndex = idx;
      renderCurrentQuestion();
    };
    grid.appendChild(btn);
  });
  filterPaletteBySection(state.activePaletteTab);
}

function filterPaletteBySection(sec) {
  state.activePaletteTab = sec;
  document.querySelectorAll("#palette-section-tabs .tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-sec") === sec);
  });

  activeQuestionBank.forEach((q, idx) => {
    const btn = document.getElementById(`pal-btn-${idx}`);
    if (btn) btn.style.display = (q.section === sec) ? "flex" : "none";
  });
}

function updatePaletteButton(idx) {
  const btn = document.getElementById(`pal-btn-${idx}`);
  if (!btn) return;

  const isAns = state.answers[idx] !== undefined;
  const isRev = state.marked.has(idx);
  const isVis = state.visited.has(idx);

  btn.className = "pal-btn";
  if (idx === state.currentQuestionIndex) btn.classList.add("current");

  if (isAns && isRev) btn.classList.add("answered-review");
  else if (isAns) btn.classList.add("answered");
  else if (isRev) btn.classList.add("review");
  else if (isVis) btn.classList.add("unanswered");
  else btn.classList.add("not-visited");
}

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  const display = document.getElementById("exam-timer");

  state.timerInterval = setInterval(() => {
    state.remainingSeconds--;
    if (state.remainingSeconds <= 0) {
      clearInterval(state.timerInterval);
      submitExam();
    }
    const h = String(Math.floor(state.remainingSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((state.remainingSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(state.remainingSeconds % 60).padStart(2, "0");
    if (display) display.innerText = `${h}:${m}:${s}`;
    saveExamState();
  }, 1000);
}

function saveExamState() {
  localStorage.setItem(STORAGE_KEYS.CURRENT_Q, state.currentQuestionIndex);
  localStorage.setItem(STORAGE_KEYS.TIME_LEFT, state.remainingSeconds);
  localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(state.answers));
  localStorage.setItem(STORAGE_KEYS.MARKED, JSON.stringify([...state.marked]));
  localStorage.setItem(STORAGE_KEYS.VISITED, JSON.stringify([...state.visited]));
}

function submitExam() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  localStorage.removeItem(STORAGE_KEYS.IS_STARTED);

  let scoreA = 0, scoreB = 0, scoreC = 0;
  let corA = 0, corB = 0, corC = 0;
  let wrgA = 0, wrgB = 0, wrgC = 0;

  activeQuestionBank.forEach((q, idx) => {
    const user = state.answers[idx];
    if (user !== undefined) {
      if (q.section === "A") {
        if (user === q.correctAnswer) { scoreA += 2.0; corA++; }
        else { scoreA -= 0.50; wrgA++; }
      } else if (q.section === "B") {
        if (user === q.correctAnswer) { scoreB += 3.0; corB++; }
        else { scoreB -= 0.75; wrgB++; }
      } else if (q.section === "C") {
        const uSorted = [...user].sort().join("");
        const cSorted = [...q.correctAnswer].sort().join("");
        if (uSorted === cSorted) { scoreC += 4.0; corC++; }
        else { wrgC++; }
      }
    }
  });

  const totalScore = Math.max(0, scoreA + scoreB + scoreC);
  const totalAtt = (corA + wrgA) + (corB + wrgB) + (corC + wrgC);

  document.getElementById("res-mock-name").innerText = `Mock Test ${state.selectedMock}`;
  document.getElementById("res-total-score").innerText = totalScore.toFixed(2);
  document.getElementById("res-attempted").innerText = `${totalAtt} / 60`;
  document.getElementById("res-correct").innerText = corA + corB + corC;
  document.getElementById("res-incorrect").innerText = wrgA + wrgB + wrgC;

  document.getElementById("res-table-body").innerHTML = `
    <tr><td>Part A</td><td>20</td><td>15</td><td>${corA+wrgA}</td><td>${corA}</td><td>${wrgA}</td><td>${scoreA.toFixed(2)}</td></tr>
    <tr><td>Part B</td><td>40</td><td>25</td><td>${corB+wrgB}</td><td>${corB}</td><td>${wrgB}</td><td>${scoreB.toFixed(2)}</td></tr>
    <tr><td>Part C</td><td>70</td><td>20</td><td>${corC+wrgC}</td><td>${corC}</td><td>${wrgC}</td><td>${scoreC.toFixed(2)}</td></tr>
  `;

  switchView("view-result");
}

function checkExistingSession() {
  const started = localStorage.getItem(STORAGE_KEYS.IS_STARTED);
  if (started === "true") {
    state.selectedMock = parseInt(localStorage.getItem(STORAGE_KEYS.ACTIVE_MOCK) || "1");
    activeQuestionBank = generateMockQuestions(state.selectedMock);
    state.currentQuestionIndex = parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_Q) || "0");
    state.remainingSeconds = parseInt(localStorage.getItem(STORAGE_KEYS.TIME_LEFT) || `${EXAM_CONFIG.durationSeconds}`);
    state.answers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANSWERS) || "{}");
    state.marked = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKED) || "[]"));
    state.visited = new Set(JSON.parse(localStorage.getItem(STORAGE_KEYS.VISITED) || "[]"));

    switchView("view-exam");
    initPalette();
    renderCurrentQuestion();
    updateStatusStrip();
    startTimer();
  } else {
    initDashboard();
  }
}

function setupEventListeners() {
  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  };

  bind("btn-back-dashboard", () => switchView("view-dashboard"));
  bind("btn-start-exam", () => startExam());
  bind("btn-prev", () => {
    if (state.currentQuestionIndex > 0) {
      state.currentQuestionIndex--;
      renderCurrentQuestion();
    }
  });
  bind("btn-next", () => {
    if (state.currentQuestionIndex < EXAM_CONFIG.totalQuestions - 1) {
      state.currentQuestionIndex++;
      renderCurrentQuestion();
    }
  });
  bind("btn-clear", () => {
    delete state.answers[state.currentQuestionIndex];
    renderCurrentQuestion();
  });
  bind("btn-mark-review", () => {
    if (state.marked.has(state.currentQuestionIndex)) state.marked.delete(state.currentQuestionIndex);
    else state.marked.add(state.currentQuestionIndex);
    updatePaletteButton(state.currentQuestionIndex);
  });
  bind("btn-open-submit", () => {
    const modal = document.getElementById("submit-modal");
    if (modal) modal.classList.remove("hidden");
  });
  bind("btn-modal-cancel", () => {
    const modal = document.getElementById("submit-modal");
    if (modal) modal.classList.add("hidden");
  });
  bind("btn-modal-confirm", () => {
    const modal = document.getElementById("submit-modal");
    if (modal) modal.classList.add("hidden");
    submitExam();
  });
  bind("btn-res-dashboard", () => {
    localStorage.clear();
    switchView("view-dashboard");
    initDashboard();
  });
  bind("btn-res-retake", () => startExam());

  document.querySelectorAll("#palette-section-tabs .tab-btn").forEach(b => {
    b.onclick = () => filterPaletteBySection(b.getAttribute("data-sec"));
  });

  bind("btn-toggle-palette", () => {
    const pal = document.getElementById("palette-sidebar");
    if (pal) pal.classList.toggle("mobile-open");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  checkExistingSession();
});
      
