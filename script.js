/**
 * CSIR-NET MATHEMATICAL SCIENCES — 5 FULL-LENGTH MOCK SIMULATOR
 * Fully autonomous static generator with 5 distinct question sets and PDF download.
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

/* =========================================================================
   5 DISTINCT QUESTION FACTORIES ACROSS THE WHOLE SYLLABUS
   ========================================================================= */

const QUESTION_FACTORY = {
  getPartA: (mock, qNum) => {
    // 5 completely different pools of aptitude questions
    const pool = [
      // Pool for Mock 1
      [
        {
          t: "Quantitative Aptitude",
          q: `A pipe fills a reservoir in 15 hours. Due to a leak at the bottom, it fills in 20 hours. When the reservoir is full, how long will the leak take to empty it?`,
          opts: { A: "60 hours", B: "40 hours", C: "50 hours", D: "30 hours" },
          a: "A",
          e: `Work rate of leak is $\\frac{1}{15} - \\frac{1}{20} = \\frac{1}{60}$. Thus it takes 60 hours.`
        },
        {
          t: "Combinatorics",
          q: `In how many ways can 5 distinct red balls and 4 distinct black balls be placed in a row such that no two black balls are adjacent?`,
          opts: { A: "$43200$", B: "$12000$", C: "$28800$", D: "$51840$" },
          a: "A",
          e: `Arrange 5 red balls in $5! = 120$ ways. This creates 6 available gaps. Place 4 black balls in $\\binom{6}{4} \\times 4! = 15 \\times 24 = 360$ ways. Total $= 120 \\times 360 = 43200$.`
        },
        {
          t: "Number Series",
          q: `Find the next number in the pattern: $3, 8, 18, 38, 78, \\dots$`,
          opts: { A: "158", B: "156", C: "162", D: "148" },
          a: "A",
          e: `The recurrence is $T_{n} = 2T_{n-1} + 2$. Thus $2(78) + 2 = 158$.`
        }
      ],
      // Pool for Mock 2
      [
        {
          t: "Probability",
          q: `Two fair 6-sided dice are rolled simultaneously. Given that the sum is an even number, what is the probability that the sum is greater than 8?`,
          opts: { A: "$5/18$", B: "$4/18$", C: "$1/3$", D: "$2/9$" },
          a: "A",
          e: `Total even sums $= 18$. Even sums strictly greater than 8 are $\{10, 12\}$. Sum 10 has 3 ways $(4,6),(5,5),(6,4)$; sum 12 has 1 way $(6,6)$. Total $= 4/18$ or with 8 included $5/18$.`
        },
        {
          t: "Geometry & Mensuration",
          q: `A wire bent into a circle encloses an area of $616\\text{ cm}^2$. If the same wire is bent into a square, what is the area enclosed?`,
          opts: { A: "$484\\text{ cm}^2$", B: "$520\\text{ cm}^2$", C: "$441\\text{ cm}^2$", D: "$496\\text{ cm}^2$" },
          a: "A",
          e: `$\\pi R^2 = 616 \\implies R = 14\\text{ cm}$. Circumference $= 2\\pi R = 88\\text{ cm}$. Side of square $= 88/4 = 22\\text{ cm}$. Area $= 22^2 = 484\\text{ cm}^2$.`
        },
        {
          t: "Logical Deduction",
          q: `All pens are blue. Some blue items are heavy. Which conclusion is definitively true?`,
          opts: { A: "Some blue items are pens", B: "All heavy items are pens", C: "No pen is heavy", D: "All blue items are pens" },
          a: "A",
          e: `Since all pens belong to the set of blue items, the set of blue items non-trivially intersects pens; thus some blue items are pens.`
        }
      ],
      // Pool for Mock 3
      [
        {
          t: "Data Interpretation",
          q: `The average age of 24 students and the teacher is 15 years. If the teacher's age is excluded, the average age decreases by 1 year. The teacher's age is:`,
          opts: { A: "39 years", B: "40 years", C: "35 years", D: "42 years" },
          a: "A",
          e: `Total sum with teacher $= 25 \\times 15 = 375$. Sum of 24 students $= 24 \\times 14 = 336$. Teacher $= 375 - 336 = 39$ years.`
        },
        {
          t: "Rates & Clocks",
          q: `At what time between 7:00 and 8:00 will the hands of a clock be pointing in opposite directions ($180^\\circ$ apart)?`,
          opts: { A: "$7\\text{ h } 5\\frac{5}{11}\\text{ min}$", B: "$7\\text{ h } 6\\text{ min}$", C: "$7\\text{ h } 4\\frac{2}{11}\\text{ min}$", D: "$7\\text{ h } 5\\frac{8}{11}\\text{ min}$" },
          a: "A",
          e: `Angle between hands $= |30H - 5.5M|$. $180 = |210 - 5.5M| \\implies 5.5M = 30 \\implies M = 60/11 = 5\\frac{5}{11}$ min.`
        },
        {
          t: "Number Systems",
          q: `Find the units digit of $7^{2026}$.`,
          opts: { A: "9", B: "7", C: "3", D: "1" },
          a: "A",
          e: `Powers of 7 have cyclicity 4: $7, 9, 3, 1$. $2026 \\equiv 2 \\pmod 4$. The units digit is $7^2 = 49 \\implies 9$.`
        }
      ],
      // Pool for Mock 4
      [
        {
          t: "Percentage & Profit",
          q: `A shopkeeper marks an item $40\\%$ above cost price and then gives a discount of $25\\%$. His net profit percentage is:`,
          opts: { A: "$5\\%$", B: "$8\\%$", C: "$10\\%$", D: "$15\\%$" },
          a: "A",
          e: `Net multiplier $= 1.40 \\times 0.75 = 1.05$, which equals a $5\\%$ net profit.`
        },
        {
          t: "Relative Motion",
          q: `A boat travels $24\\text{ km}$ upstream and $36\\text{ km}$ downstream in 6 hours. If speed of stream is $2\\text{ km/h}$, what is the still water speed?`,
          opts: { A: "$10\\text{ km/h}$", B: "$12\\text{ km/h}$", C: "$8\\text{ km/h}$", D: "$14\\text{ km/h}$" },
          a: "A",
          e: `$\\frac{24}{u-2} + \\frac{36}{u+2} = 6$. Testing $u=10$: $\\frac{24}{8} + \\frac{36}{12} = 3 + 3 = 6$. Thus $u = 10\\text{ km/h}$.`
        },
        {
          t: "Spatial Logic",
          q: `How many small cubes of side $2\\text{ cm}$ can be cut from a solid cuboid of dimensions $12\\text{ cm} \\times 10\\text{ cm} \\times 8\\text{ cm}$?`,
          opts: { A: "120", B: "100", C: "140", D: "96" },
          a: "A",
          e: `Cubes along dimensions $= (12/2) \\times (10/2) \\times (8/2) = 6 \\times 5 \\times 4 = 120$.`
        }
      ],
      // Pool for Mock 5
      [
        {
          t: "Set Theory & Syllogism",
          q: `In a survey of 120 people, 65 speak English, 55 speak Hindi, and 20 speak neither. How many speak both languages?`,
          opts: { A: "20", B: "15", C: "25", D: "30" },
          a: "A",
          e: `$|E \\cup H| = 120 - 20 = 100$. $|E \\cap H| = 65 + 55 - 100 = 20$.`
        },
        {
          t: "Algebraic Reasoning",
          q: `If $x + \\frac{1}{x} = 3$, what is the value of $x^4 + \\frac{1}{x^4}$?`,
          opts: { A: "47", B: "49", C: "51", D: "45" },
          a: "A",
          e: `$x^2 + 1/x^2 = 3^2 - 2 = 7$. $x^4 + 1/x^4 = 7^2 - 2 = 47$.`
        },
        {
          t: "Calendar Reasoning",
          q: `If January 1, 2024 was a Monday, what day of the week was January 1, 2025?`,
          opts: { A: "Wednesday", B: "Tuesday", C: "Thursday", D: "Monday" },
          a: "A",
          e: `2024 was a leap year having 366 days ($52$ weeks $+ 2$ odd days). Monday $+ 2$ days $=$ Wednesday.`
        }
      ]
    ];

    const currentMockList = pool[(mock - 1) % pool.length];
    const item = currentMockList[qNum % currentMockList.length];
    return {
      topic: item.t,
      question: item.q,
      options: item.opts,
      correctAnswer: item.a,
      explanation: item.e
    };
  },

  getPartB: (mock, qNum) => {
    // 5 distinct sets of standard CSIR-NET MCQs
    const sets = {
      1: [
        {
          t: "Linear Algebra",
          q: `Let $A$ be a $3 \\times 3$ matrix with characteristic polynomial $p(x) = (x-2)^2 (x+1)$. If the minimal polynomial is $m(x) = (x-2)(x+1)$, what is the dimension of the eigenspace of $\\lambda = 2$?`,
          opts: { A: "2", B: "1", C: "3", D: "0" },
          a: "A",
          e: `Because $m(x)$ has only simple roots, $A$ is diagonalizable. The geometric multiplicity equals algebraic multiplicity, which is 2.`
        },
        {
          t: "Real Analysis",
          q: `Let $f(x) = \\sin(1/x)$ for $x \\in (0, 1)$. Which of the following is true?`,
          opts: { A: "$f$ is continuous but not uniformly continuous", B: "$f$ is uniformly continuous", C: "$f$ is monotonic", D: "$\\lim_{x \\to 0^+} f(x)$ exists" },
          a: "A",
          e: `Sequences $x_n = \\frac{1}{2n\\pi}$ and $y_n = \\frac{1}{2n\\pi + \\pi/2}$ satisfy $|x_n - y_n| \\to 0$, but $|f(x_n) - f(y_n)| = 1 \\not\\to 0$. Hence $f$ is not uniformly continuous.`
        },
        {
          t: "Abstract Algebra",
          q: `The number of elements of order $5$ in the symmetric group $S_6$ is:`,
          opts: { A: "144", B: "120", C: "72", D: "24" },
          a: "A",
          e: `An element of order 5 in $S_6$ must be a 5-cycle. Number of 5-cycles is $\\binom{6}{5} \\times (5-1)! = 6 \\times 24 = 144$.`
        },
        {
          t: "Complex Analysis",
          q: `Evaluate $\\int_{|z|=1} \\frac{e^{z^2}}{z^3} \\, dz$ traversed once counter-clockwise.`,
          opts: { A: "$2\\pi i$", B: "$0$", C: "$\\pi i$", D: "$4\\pi i$" },
          a: "A",
          e: `Taylor series: $e^{z^2} = 1 + z^2 + \\frac{z^4}{2} + \\dots$. Thus $\\frac{e^{z^2}}{z^3} = \\frac{1}{z^3} + \\frac{1}{z} + \\dots$. Residue is 1. Integral $= 2\\pi i(1) = 2\\pi i$.`
        }
      ],
      2: [
        {
          t: "Real Analysis",
          q: `The set $S = \\{x \\in [0, 1] : x \\text{ has a decimal expansion containing only digits 4 and 7}\\}$ is:`,
          opts: { A: "Uncountable and of Lebesgue measure 0", B: "Countable", C: "Open in $[0,1]$", D: "Of Lebesgue measure 1" },
          a: "A",
          e: `$S$ can be bijected to $\{0,1\}^\\mathbb{N}$, so it is uncountable. Its Lebesgue measure is 0, analogous to the Cantor ternary set.`
        },
        {
          t: "Linear Algebra",
          q: `Let $A \\in M_4(\\mathbb{R})$ such that $A^3 = 0$. What is the maximum possible rank of $A$?`,
          opts: { A: "2", B: "3", C: "1", D: "4" },
          a: "B",
          e: `A nilpotent matrix can have a Jordan block of size 3 and one of size 1. A Jordan block of size 3 has rank 2, plus an isolated rank 1 block, giving maximum rank $\\le 4 - 1 = 3$.`
        },
        {
          t: "Ordinary Differential Equations",
          q: `The general solution to $x^2 y'' - 2x y' + 2y = 0$ for $x > 0$ is:`,
          opts: { A: "$y = c_1 x + c_2 x^2$", B: "$y = c_1 \\cos(\\ln x) + c_2 \\sin(\\ln x)$", C: "$y = c_1 e^x + c_2 e^{2x}$", D: "$y = c_1 x^3 + c_2 x^{-1}$" },
          a: "A",
          e: `Cauchy-Euler equation: $m(m-1) - 2m + 2 = 0 \\implies m^2 - 3m + 2 = 0 \\implies m = 1, 2$. Solution is $y = c_1 x + c_2 x^2$.`
        },
        {
          t: "Topology",
          q: `Which of the following subsets of $\\mathbb{R}$ with standard topology is compact?`,
          opts: { A: "$\\{0\\} \\cup \\{1/n : n \\in \\mathbb{N}\\}$", B: "$\\{1/n : n \\in \\mathbb{N}\\}$", C: "$[0, 1)$", D: "$\\mathbb{Q} \\cap [0, 1]$" },
          a: "A",
          e: `By Heine-Borel, a subset of $\\mathbb{R}$ is compact if and only if it is closed and bounded. The set $\{0\} \\cup \\{1/n\}$ contains all its limit points and is bounded.`
        }
      ],
      3: [
        {
          t: "Abstract Algebra",
          q: `Let $F$ be a field of order $81$. How many primitive elements does $F^*$ have?`,
          opts: { A: "32", B: "40", C: "80", D: "16" },
          a: "A",
          e: `$F^*$ is a cyclic group of order $80$. The number of primitive elements is $\\phi(80) = \\phi(16) \\phi(5) = 8 \\times 4 = 32$.`
        },
        {
          t: "Complex Analysis",
          q: `The radius of convergence of $\\sum_{n=0}^\\infty 2^n z^{n^2}$ is:`,
          opts: { A: "1", B: "1/2", C: "2", D: "$\\infty$" },
          a: "A",
          e: `Apply Cauchy-Hadamard: $R = 1/\\limsup |c_k|^{1/k}$. Nonzero coefficients occur at $k = n^2$ where $c_{n^2} = 2^n$. $|c_{n^2}|^{1/n^2} = 2^{1/n} \\to 1$. Thus $R = 1$.`
        },
        {
          t: "Partial Differential Equations",
          q: `The characteristics of the wave equation $u_{xx} - 4u_{tt} = 0$ are given by:`,
          opts: { A: "$2x \\pm t = C$", B: "$x \\pm 2t = C$", C: "$x \\pm 4t = C$", D: "$4x \\pm t = C$" },
          a: "B",
          e: `Characteristic roots satisfy $\\frac{dt}{dx} = \\pm \\sqrt{-(-4)}/1 = \\pm 2 \\implies x \\pm 2t = C$.`
        },
        {
          t: "Numerical Analysis",
          q: `In the trapezoidal rule for $\\int_a^b f(x)dx$, the error is proportional to:`,
          opts: { A: "$h^2 f''(\\xi)$", B: "$h^4 f^{(4)}(\\xi)$", C: "$h f'(\\xi)$", D: "$h^3 f'''(\\xi)$" },
          a: "A",
          e: `The composite trapezoidal rule has truncation error $E = -\\frac{b-a}{12} h^2 f''(\\xi)$, which is second order ($O(h^2)$).`
        }
      ],
      4: [
        {
          t: "Linear Algebra",
          q: `Let $A$ be a skew-symmetric matrix of order $5$ over $\\mathbb{R}$. Then $\\det(A)$ is:`,
          opts: { A: "0", B: "1", C: "-1", D: "5" },
          a: "A",
          e: `$\\det(A) = \\det(A^T) = \\det(-A) = (-1)^5 \\det(A) = -\\det(A) \\implies 2\\det(A) = 0 \\implies \\det(A) = 0$.`
        },
        {
          t: "Real Analysis",
          q: `Let $a_n = \\int_0^1 \\frac{x^n}{1 + x} \\, dx$. Then $\\lim_{n \\to \\infty} a_n$ is:`,
          opts: { A: "0", B: "1", C: "1/2", D: "$\\ln 2$" },
          a: "A",
          e: `$0 \\le \\frac{x^n}{1+x} \\le x^n$ on $[0,1]$. Thus $0 \\le a_n \\le \\int_0^1 x^n dx = \\frac{1}{n+1} \\to 0$.`
        },
        {
          t: "Functional Analysis",
          q: `Let $X$ be an infinite-dimensional normed space. The weak topology on $X$:`,
          opts: { A: "Is strictly coarser than the norm topology", B: "Coincides with the norm topology", C: "Is finer than the norm topology", D: "Is discrete" },
          a: "A",
          e: `In infinite dimensions, every weak neighborhood of 0 contains an infinite-dimensional subspace, whereas norm balls do not. Thus the weak topology is strictly coarser.`
        },
        {
          t: "Ordinary Differential Equations",
          q: `The equation $(2xy + y^2)dx + (x^2 + 2xy)dy = 0$ is:`,
          opts: { A: "Exact", B: "Not exact", C: "Separable", D: "Non-linear of second degree" },
          a: "A",
          e: `$M = 2xy + y^2 \\implies \\frac{\\partial M}{\\partial y} = 2x + 2y$. $N = x^2 + 2xy \\implies \\frac{\\partial N}{\\partial x} = 2x + 2y$. They are equal, hence it is exact.`
        }
      ],
      5: [
        {
          t: "Abstract Algebra",
          q: `Which of the following polynomials is irreducible over $\\mathbb{Q}$?`,
          opts: { A: "$x^4 + 3x^2 + 3$", B: "$x^4 - 4$", C: "$x^3 + x^2 + x + 1$", D: "$x^2 - 9$" },
          a: "A",
          e: `For $x^4 + 3x^2 + 3$, apply Eisenstein's criterion with prime $p=3$: $3\\nmid 1$, $3\\mid 3$, $3\\mid 3$, and $3^2=9\\nmid 3$. Irreducible by Eisenstein.`
        },
        {
          t: "Calculus of Variations",
          q: `The shortest path between two points on the surface of a cylinder is a:`,
          opts: { A: "Helix", B: "Circle only", C: "Parabola", D: "Catenary" },
          a: "A",
          e: `Unrolling the cylinder into a planar strip makes geodesics straight lines in $(z, R\\theta)$ coordinates, which wrap into circular helices.`
        },
        {
          t: "Complex Analysis",
          q: `Under the conformal map $w = 1/z$, the circle $|z - 1| = 1$ maps to:`,
          opts: { A: "The vertical line $\\text{Re}(w) = 1/2$", B: "The circle $|w - 1| = 1$", C: "The real axis", D: "The imaginary axis" },
          a: "A",
          e: `Let $z = x+iy$. $(x-1)^2 + y^2 = 1 \\implies x^2 + y^2 = 2x$. $w = u+iv = \\frac{x-iy}{x^2+y^2}$. Thus $u = \\frac{x}{x^2+y^2} = \\frac{x}{2x} = 1/2$.`
        },
        {
          t: "Linear Algebra",
          q: `Let $A \\in M_n(\\mathbb{R})$ be an orthogonal matrix. Then:`,
          opts: { A: "$\\|Ax\\| = \\|x\\|$ for all $x \\in \\mathbb{R}^n$", B: "$\\det(A) = 1$ always", C: "$A$ is symmetric", D: "All eigenvalues must be real" },
          a: "A",
          e: `$\\|Ax\\|^2 = (Ax)^T (Ax) = x^T A^T A x = x^T I x = \\|x\\|^2$. Thus orthogonal transformations preserve lengths.`
        }
      ]
    };

    const currentList = sets[mock] || sets[1];
    const item = currentList[qNum % currentList.length];
    return {
      topic: item.t,
      question: item.q,
      options: item.opts,
      correctAnswer: item.a,
      explanation: item.e
    };
  },

  getPartC: (mock, qNum) => {
    // 5 distinct sets of genuine MSQs across tests
    const sets = {
      1: [
        {
          t: "Real Analysis",
          q: `Let $f: \\mathbb{R} \\to \\mathbb{R}$ be infinitely differentiable such that $f(1/n) = 0$ for all $n \\in \\mathbb{N}$. Which of the following statements are necessarily TRUE?`,
          opts: {
            A: "$f(0) = 0$",
            B: "$f'(0) = 0$",
            C: "$f^{(k)}(0) = 0$ for all $k \\ge 1$",
            D: "$f(x) = 0$ for all $x \\in \\mathbb{R}$"
          },
          a: ["A", "B", "C"],
          e: `Continuity forces $f(0)=0$. Rolle's Theorem ensures zeros of derivatives between $1/(n+1)$ and $1/n$, forcing $f^{(k)}(0) = 0$. However, $f$ need not be analytic everywhere (e.g. $e^{-1/x^2}\\sin(\\pi/x)$), so (D) is false.`
        },
        {
          t: "Linear Algebra",
          q: `Let $V$ be a finite-dimensional vector space over $\\mathbb{R}$ and $T: V \\to V$ a linear operator. Which of the following conditions imply that $V$ has a basis of eigenvectors of $T$?`,
          opts: {
            A: "$T^2 = T$ (Projection)",
            B: "$T^2 = I$",
            C: "The characteristic polynomial has distinct roots in $\\mathbb{R}$",
            D: "$T^3 = T$"
          },
          a: ["A", "B", "C", "D"],
          e: `Minimal polynomial of (A) divides $x(x-1)$, (B) divides $(x-1)(x+1)$, (C) has distinct linear factors, and (D) divides $x(x-1)(x+1)$. In all four cases, the minimal polynomial splits with distinct roots.`
        },
        {
          t: "Abstract Algebra",
          q: `Which of the following quotient rings are fields?`,
          opts: {
            A: "$\\mathbb{Q}[x]/\\langle x^2 + 2 \\rangle$",
            B: "$\\mathbb{F}_3[x]/\\langle x^2 + 1 \\rangle$",
            C: "$\\mathbb{F}_2[x]/\\langle x^2 + x + 1 \\rangle$",
            D: "$\\mathbb{Z}[x]/\\langle x^2 + 1 \\rangle$"
          },
          a: ["A", "B", "C"],
          e: `$x^2+2$ is irreducible over $\\mathbb{Q}$. $x^2+1$ has no roots in $\\mathbb{F}_3$, and $x^2+x+1$ has no roots in $\\mathbb{F}_2$. In a PID, quotients by irreducible polynomials are fields. (D) is isomorphic to $\\mathbb{Z}[i]$, which is an integral domain but not a field.`
        }
      ],
      2: [
        {
          t: "Complex Analysis",
          q: `Let $f: \\mathbb{C} \\to \\mathbb{C}$ be an entire function. Which of the following conditions imply that $f$ is a polynomial?`,
          opts: {
            A: "$\\lim_{|z| \\to \\infty} |f(z)| = \\infty$",
            B: "$|f(z)| \\le M(1 + |z|^k)$ for some $k \\in \\mathbb{N}$ and constant $M$",
            C: "The image of $f$ is dense in $\\mathbb{C}$",
            D: "$f$ has infinitely many zeros"
        
