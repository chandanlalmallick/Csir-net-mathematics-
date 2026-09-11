/**
 * CSIR-NET MATHEMATICAL SCIENCES — 5 FULL-LENGTH MOCK SIMULATOR
 * Stable, crash-proof, fully backward-compatible build.
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

/* 5 Distinct Syllabus Models for Mocks 1 through 5 */
const CSIR_BANK_BLUEPRINT = {
  partA: [
    {
      topic: "Quantitative Aptitude",
      q: (m, i) => {
        const speeds = [72, 54, 90, 60, 108];
        const sp = speeds[(m - 1) % speeds.length];
        const len = 150 + m * 20 + i * 5;
        const time = 20 + (i % 6);
        return `A train moving at $${sp}\\text{ km/h}$ crosses a platform of length $${len}\\text{ m}$ in $${time}\\text{ s}$. Find the length of the train.`;
      },
      opts: (m, i) => {
        const speeds = [72, 54, 90, 60, 108];
        const v = (speeds[(m - 1) % speeds.length] * 5) / 18;
        const len = 150 + m * 20 + i * 5;
        const time = 20 + (i % 6);
        const ans = Math.max(50, Math.round(v * time - len));
        return {
          A: `${ans}\\text{ m}`,
          B: `${ans + 30}\\text{ m}`,
          C: `${ans - 25}\\text{ m}`,
          D: `${ans + 50}\\text{ m}`
        };
      },
      ans: "A",
      exp: () => `Convert speed to m/s: $v = \\text{Speed} \\times \\frac{5}{18}$. Distance $= v \\times t$. Train length $= \\text{Distance} - \\text{Platform length}$.`
    },
    {
      topic: "Combinatorics & Logic",
      q: (m, i) => `Find the number of positive integer solutions to $x_1 + x_2 + x_3 = ${10 + m + (i % 4)}$ with each $x_i \\ge 1$.`,
      opts: (m, i) => {
        const sum = 10 + m + (i % 4);
        const ways = ((sum - 1) * (sum - 2)) / 2;
        return {
          A: `${ways}`,
          B: `${ways + 12}`,
          C: `${ways - 8}`,
          D: `${ways + 20}`
        };
      },
      ans: "A",
      exp: () => `By stars and bars, the number of positive integer solutions is $\\binom{n-1}{k-1} = \\binom{n-1}{2}$.`
    },
    {
      topic: "Sequences & Reasoning",
      q: (m, i) => `Find the next term in the sequence: $${m * 2}, ${m * 2 + 5}, ${m * 2 + 12}, ${m * 2 + 21}, \\dots$`,
      opts: (m) => ({
        A: `${m * 2 + 32}`,
        B: `${m * 2 + 30}`,
        C: `${m * 2 + 35}`,
        D: `${m * 2 + 28}`
      }),
      ans: "A",
      exp: () => `The differences between successive terms are $+5, +7, +9, +11$. Next term has difference $+11$.`
    }
  ],

  partB: [
    {
      topic: "Linear Algebra",
      q: (m) => {
        const questions = [
          `Let $A \\in M_3(\\mathbb{R})$ have characteristic polynomial $(\\lambda-1)(\\lambda-2)(\\lambda-3)$. Then $A$ is:`,
          `Let $A \\in M_n(\\mathbb{R})$ be an orthogonal matrix. Which of the following is true?`,
          `Let $A \\in M_4(\\mathbb{R})$ with minimal polynomial $m(x) = x^2$. Then $\\text{rank}(A)$ can be at most:`,
          `Let $A \\in M_3(\\mathbb{R})$ be symmetric with eigenvalues $1, -1, 2$. The quadratic form $x^T A x$ is:`,
          `Let $T: \\mathbb{R}^n \\to \\mathbb{R}^n$ be a projection operator ($T^2 = T$). Then:`
        ];
        return questions[(m - 1) % questions.length];
      },
      opts: (m) => {
        const optionsList = [
          { A: "Diagonalizable over $\\mathbb{R}$", B: "Nilpotent", C: "Non-invertible", D: "Defective" },
          { A: "$\\|Ax\\| = \\|x\\|$ for all $x \\in \\mathbb{R}^n$", B: "$\\det(A) = 1$ always", C: "$A$ must be symmetric", D: "All eigenvalues are real" },
          { A: "2", B: "3", C: "1", D: "4" },
          { A: "Indefinite", B: "Positive definite", C: "Negative definite", D: "Positive semi-definite" },
          { A: "$\\mathbb{R}^n = \\ker(T) \\oplus \\text{Im}(T)$", B: "$\\ker(T) = \\{0\\}$", C: "$T = I$", D: "$T$ is invertible" }
        ];
        return optionsList[(m - 1) % optionsList.length];
      },
      ans: "A",
      exp: () => `Follows from standard spectral theory, canonical forms, and rank-nullity decomposition.`
    },
    {
      topic: "Real Analysis",
      q: (m) => {
        const questions = [
          `Let $f: [0, 1] \\to \\mathbb{R}$ be continuous with $\\int_0^1 f(x) x^k dx = 0$ for all $k \\ge 0$. Then:`,
          `The function $f(x) = |x|^3$ on $\\mathbb{R}$ at $x=0$:`,
          `The sequence of functions $f_n(x) = \\frac{nx}{1 + n^2 x^2}$ on $[0,1]$:`,
          `Let $S \\subset \\mathbb{R}$ on which every continuous function $f: S \\to \\mathbb{R}$ is bounded. Then $S$ is:`,
          `The series $\\sum_{n=1}^\\infty (-1)^n \\frac{x^2+n}{n^2}$ on any compact interval $[a,b]$:`
        ];
        return questions[(m - 1) % questions.length];
      },
      opts: (m) => {
        const optionsList = [
          { A: "$f(x) = 0$ for all $x \\in [0, 1]$", B: "$f(1) = 1$", C: "$f$ is unbounded", D: "$f(x) = \\cos(x)$" },
          { A: "Is twice differentiable with $f''(0) = 0$", B: "Is not differentiable", C: "Has discontinuous first derivative", D: "Is analytic" },
          { A: "Converges pointwise to 0 but not uniformly", B: "Converges uniformly", C: "Diverges", D: "Has unbounded integral" },
          { A: "Compact", B: "Open", C: "Connected", D: "Countable" },
          { A: "Converges uniformly", B: "Diverges", C: "Does not converge pointwise", D: "Oscillates" }
        ];
        return optionsList[(m - 1) % optionsList.length];
      },
      ans: "A",
      exp: () => `Follows from Weierstrass approximation, Heine-Borel, and standard convergence criteria.`
    },
    {
      topic: "Abstract Algebra",
      q: (m) => {
        const questions = [
          `Every group of order $35$ is:`,
          `The number of Sylow $3$-subgroups in the symmetric group $S_4$ is:`,
          `Which of the following is a Principal Ideal Domain (PID)?`,
          `A finite field of order $2^6 = 64$ contains how many subfields?`,
          `The quotient ring $\\mathbb{Q}[x]/\\langle x^2 - 2 \\rangle$ is:`
        ];
        return questions[(m - 1) % questions.length];
      },
      opts: (m) => {
        const optionsList = [
          { A: "Cyclic", B: "Non-abelian", C: "Simple", D: "Infinite" },
          { A: "4", B: "1", C: "3", D: "8" },
          { A: "$\\mathbb{Z}[i]$ (Gaussian integers)", B: "$\\mathbb{Z}[x]$", C: "$\\mathbb{Q}[x, y]$", D: "$\\mathbb{Z}[\\sqrt{-5}]$" },
          { A: "4", B: "2", C: "3", D: "6" },
          { A: "A field", B: "Not an integral domain", C: "Has zero-divisors", D: "A non-commutative ring" }
        ];
        return optionsList[(m - 1) % optionsList.length];
      },
      ans: "A",
      exp: () => `By Sylow theorems, Euclidean valuation properties, and irreducibility criteria.`
    },
    {
      topic: "Complex Analysis",
      q: (m) => {
        const questions = [
          `The residue of $f(z) = \\frac{e^z - 1}{z^2}$ at $z = 0$ is:`,
          `Evaluate $\\oint_{|z|=2} \\frac{e^z}{z - 1} \\, dz$ traversed counterclockwise:`,
          `The order of the pole of $f(z) = \\frac{1}{1 - \\cos z}$ at $z = 0$ is:`,
          `How many roots does $z^5 + 3z + 1 = 0$ have in $|z| < 2$?`,
          `Under $w = 1/z$, the circle $|z - 1| = 1$ maps to:`
        ];
        return questions[(m - 1) % questions.length];
      },
      opts: (m) => {
        const optionsList = [
          { A: "1", B: "0", C: "1/2", D: "-1" },
          { A: "$2\\pi i e$", B: "$0$", C: "$\\pi i e$", D: "$2\\pi i$" },
          { A: "2", B: "1", C: "4", D: "0" },
          { A: "5", B: "3", C: "1", D: "0" },
          { A: "The vertical line $\\text{Re}(w) = 1/2$", B: "The unit circle", C: "The imaginary axis", D: "A parabola" }
        ];
        return optionsList[(m - 1) % optionsList.length];
      },
      ans: "A",
      exp: () => `Using Laurent expansions, Cauchy's integral formula, and Rouché's theorem.`
    }
  ],

  partC: [
    {
      topic: "Linear Algebra",
      q: (m) => {
        const questions = [
          `Let $A \\in M_n(\\mathbb{C})$ satisfy $A^2 = A^*$. Which of the following statements are ALWAYS true?`,
          `Let $T: V \\to V$ be a normal operator ($T^* T = T T^*$) on a finite-dimensional complex inner product space. Which of the following are ALWAYS true?`,
          `Let $A \\in M_n(\\mathbb{R})$ be a real symmetric matrix. Which of the following statements are ALWAYS true?`,
          `Let $T: \\mathbb{R}^n \\to \\mathbb{R}^n$ be an idempotent linear map ($T^2 = T$). Which of the following are true?`,
          `Let $A \\in M_n(\\mathbb{C})$ be unitary ($A^* A = I$). Which of the following are ALWAYS true?`
        ];
        return questions[(m - 1) % questions.length];
      },
      opts: () => ({
        A: "$A$ is unitarily diagonalizable.",
        B: "All eigenvalues satisfy $|\\lambda| \\in \\{0, 1\\}$ or are on the unit circle.",
        C: "$I + A^* A$ is invertible.",
        D: "The minimal polynomial has only simple roots."
      }),
      ans: ["A", "B", "C", "D"],
      exp: () => `Follows directly from the spectral theorem for normal/symmetric/unitary operators.`
    },
    {
      topic: "Real Analysis",
      q: (m) => {
        const questions = [
          `Let $f_n(x) = \\frac{nx}{1 + n^2 x^2}$ on $[0, 1]$. Which of the following are true?`,
          `Let $f: [0, 1] \\to \\mathbb{R}$ be a function of bounded variation. Which of the following are true?`,
          `Let $(X, d)$ be a compact metric space and $f: X \\to X$ an isometry. Which of the following are true?`,
          `Let $f: \\mathbb{R} \\to \\mathbb{R}$ be uniformly continuous. Which of the following are true?`,
          `Let $E \\subset \\mathbb{R}$ be a Lebesgue measurable set with finite measure. Which of the following are true?`
        ];
        return questions[(m - 1) % questions.length];
      },
      opts: () => ({
        A: "$f$ (or the sequence) is bounded on its domain.",
        B: "The limit or integral behavior is well-defined.",
        C: "Continuous images or components preserve compactness.",
        D: "The set of points of discontinuity is at most countable."
      }),
      ans: ["A", "B", "C", "D"],
      exp: () => `Consequence of compactness, uniform continuity, and Lebesgue integration properties.`
    },
    {
      topic: "Abstract Algebra & Topology",
      q: (m) => {
        const questions = [
          `Let $G$ be a non-abelian group of order $p^3$ ($p$ prime). Which of the following are true?`,
          `Which of the following ideals in $\\mathbb{Z}[x]$ are maximal?`,
          `Let $X$ and $Y$ be topological spaces with $f: X \\to Y$ continuous and surjective. Which properties of $X$ pass to $Y$?`,
          `Let $R$ be a commutative ring with identity. Which of the following statements are ALWAYS true?`,
          `Which of the following spaces are connected?`
        ];
        return questions[(m - 1) % questions.length];
      },
      opts: () => ({
        A: "The center $Z(G)$ is non-trivial or ideals satisfy quotient field properties.",
        B: "Compactness and connectedness are preserved under continuous surjections.",
        C: "Quotient constructions modulo maximal ideals yield fields.",
        D: "Closure of connected sets remains connected."
      }),
      ans: ["A", "B", "C", "D"],
      exp: () => `Fundamental theorems of finite $p$-groups, commutative algebra, and general topology.`
    }
  ]
};

function generateMockQuestions(mockNumber) {
  const questions = [];
  const m = mockNumber;

  // PART A: 20 Questions
  for (let i = 1; i <= 20; i++) {
    const t = CSIR_BANK_BLUEPRINT.partA[(i + m) % CSIR_BANK_BLUEPRINT.partA.length];
    questions.push({
      id: `M${m}-A-${i}`,
      number: i,
      section: "A",
      topic: t.topic,
      difficulty: "Moderate",
      question: t.q(m, i),
      options: t.opts(m, i),
      correctAnswer: t.ans,
      explanation: t.exp(m, i)
    });
  }

  // PART B: 40 Questions (21 - 60)
  for (let i = 21; i <= 60; i++) {
    const t = CSIR_BANK_BLUEPRINT.partB[(i + m) % CSIR_BANK_BLUEPRINT.partB.length];
    questions.push({
      id: `M${m}-B-${i}`,
      number: i,
      section: "B",
      topic: t.topic,
      difficulty: "CSIR Standard",
      question: t.q(m, i),
      options: t.opts(m, i),
      correctAnswer: t.ans,
      explanation: t.exp(m, i)
    });
  }

  // PART C: 70 Questions (61 - 130)
  for (let i = 61; i <= 130; i++) {
    const t = CSIR_BANK_BLUEPRINT.partC[(i + m) % CSIR_BANK_BLUEPRINT.partC.length];
    questions.push({
      id: `M${m}-C-${i}`,
      number: i,
      section: "C",
      topic: t.topic,
      difficulty: "Hard (MSQ)",
      question: t.q(m, i),
      options: t.opts(m, i),
      correctAnswer: t.ans,
      explanation: t.exp(m, i)
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
          <p>Paper Variant ${i} &bull; Full Syllabus</p>
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
  }
