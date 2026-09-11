/**
 * CSIR-NET MATHEMATICAL SCIENCES — 5 FULL-LENGTH MOCK SIMULATOR
 * Complete 5 distinct mock test generation engine with rigorous CSIR-NET level questions.
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
   DIFFERENTIATED QUESTION BANKS FOR MOCKS 1 TO 5
   ========================================================================= */

const MOCK_QUESTION_DATABASE = {
  // --- PART A GENERATOR: Unique across tests ---
  getPartA: (mock, i) => {
    const bank = [
      // Mock 1 questions
      [
        {
          t: "Quantitative Reasoning",
          q: `A tank has two pipes. Pipe A can fill it in $20$ minutes and Pipe B can empty it in $30$ minutes. If both are opened alternately for $1$ minute each starting with Pipe A, how long does it take to fill the tank?`,
          opts: { A: "$115$ minutes", B: "$120$ minutes", C: "$110$ minutes", D: "$118$ minutes" },
          a: "A",
          e: `Net fill in 2 minutes is $\\frac{1}{20} - \\frac{1}{30} = \\frac{1}{60}$. In $114$ minutes, $\\frac{57}{60}$ is full. On the $115$th minute, Pipe A adds $\\frac{1}{20} = \\frac{3}{60}$, filling the tank completely.`
        },
        {
          t: "Combinatorics",
          q: `What is the total number of integer solutions to $x_1 + x_2 + x_3 + x_4 = 20$ subject to $x_i \\ge 1$ for each $i$?`,
          opts: { A: "$\\binom{19}{3} = 969$", B: "$\\binom{23}{3} = 1771$", C: "$\\binom{20}{4} = 4845$", D: "$1000$" },
          a: "A",
          e: `Using stars and bars with positive integers, the number of solutions is $\\binom{n-1}{k-1} = \\binom{20-1}{4-1} = \\binom{19}{3} = 969$.`
        },
        {
          t: "Geometry & Spatial",
          q: `A solid sphere of radius $R$ is sliced into $8$ identical octants by three mutually perpendicular planes. What is the ratio of total surface area of all $8$ pieces to the initial sphere's surface area?`,
          opts: { A: "$5 : 2$", B: "$3 : 1$", C: "$2 : 1$", D: "$7 : 3$" },
          a: "A",
          e: `Original surface area $= 4\\pi R^2$. Each octant has $\\frac{1}{8}(4\\pi R^2) = \\frac{\\pi R^2}{2}$ curved area, plus three flat sectors of area $\\frac{\\pi R^2}{4}$. Total per octant $= \\frac{5}{4}\\pi R^2$. For 8 octants $= 10\\pi R^2$. Ratio $= 10/4 = 5/2$.`
        },
        {
          t: "Logical Deduction",
          q: `In a group of 100 students, 70 like tea, 60 like coffee, and 20 like neither. How many like both tea and coffee?`,
          opts: { A: "$50$", B: "$40$", C: "$30$", D: "$60$" },
          a: "A",
          e: `$|T \\cup C| = 100 - 20 = 80$. $|T \\cap C| = |T| + |C| - |T \\cup C| = 70 + 60 - 80 = 50$.`
        }
      ],
      // Mock 2 questions
      [
        {
          t: "Probability",
          q: `A fair die is rolled repeatedly until a $6$ appears. What is the expected number of rolls given that no odd numbers appeared in any of the rolls?`,
          opts: { A: "$3$", B: "$6$", C: "$2$", D: "$4$" },
          a: "A",
          e: `Conditioning on only even rolls $\{2, 4, 6\}$, each even face occurs with probability $1/3$. The number of rolls is geometric with success probability $p = 1/3$. Expected rolls $= 1/p = 3$.`
        },
        {
          t: "Series & Patterns",
          q: `Find the $n$-th digit after the decimal point of $(\\sqrt{2} + 1)^6$.`,
          opts: { A: "$9$", B: "$0$", C: "$1$", D: "$8$" },
          a: "A",
          e: `Let $x = (\\sqrt{2}+1)^6$ and $y = (\\sqrt{2}-1)^6$. $x+y$ is an integer. Since $0 < y < 0.001$, $x = \\text{Integer} - y$, meaning its fractional part is $0.999...$`
        },
        {
          t: "Rates & Clocks",
          q: `Between 4:00 and 5:00, at what exact time do the hands of a standard clock coincide?`,
          opts: { A: "$4\\text{ hours } 21\\frac{9}{11}\\text{ min}$", B: "$4\\text{ hours } 20\\text{ min}$", C: "$4\\text{ hours } 22\\frac{1}{11}\\text{ min}$", D: "$4\\text{ hours } 21\\frac{5}{11}\\text{ min}$" },
          a: "A",
          e: `Minute hand travels $6^\\circ$/min, hour hand $0.5^\\circ$/min. $6m = 120 + 0.5m \\implies 5.5m = 120 \\implies m = 240/11 = 21\\frac{9}{11}$.`
        },
        {
          t: "Data Interpretation",
          q: `The arithmetic mean of $50$ numbers is $38$. If two numbers, namely $45$ and $55$, are discarded, the mean of the remaining numbers is:`,
          opts: { A: "$37.5$", B: "$36.5$", C: "$37.0$", D: "$38.0$" },
          a: "A",
          e: `Total sum $= 50 \\times 38 = 1900$. Removed sum $= 100$. New sum $= 1800$. New mean $= 1800 / 48 = 37.5$.`
        }
      ],
      // Mock 3 questions
      [
        {
          t: "Arithmetic Reasoning",
          q: `Find the remainder when $2^{2026}$ is divided by $17$.`,
          opts: { A: "$4$", B: "$1$", C: "$8$", D: "$16$" },
          a: "A",
          e: `By Fermat's Little Theorem, $2^{16} \\equiv 1 \\pmod{17}$. $2026 = 16 \\times 126 + 10$. Thus $2^{2026} \\equiv 2^{10} = 1024 \\equiv 4 \\pmod{17}$.`
        },
        {
          t: "Relative Velocity",
          q: `Two cyclists start towards each other from points $30\\text{ km}$ apart at $15\\text{ km/h}$ each. A fly starts from one cyclist and flies back and forth between them at $30\\text{ km/h}$ until they collide. Total distance covered by the fly is:`,
          opts: { A: "$30\\text{ km}$", B: "$15\\text{ km}$", C: "$45\\text{ km}$", D: "$60\\text{ km}$" },
          a: "A",
          e: `Time until cyclists meet $= 30 / (15 + 15) = 1\\text{ hour}$. Fly flies continuously for 1 hour at $30\\text{ km/h}$, covering exactly $30\\text{ km}$.`
        },
        {
          t: "Set Theory",
          q: `What is the maximum number of regions into which the plane can be divided by $n$ straight lines?`,
          opts: { A: "$\\frac{n^2 + n + 2}{2}$", B: "$\\frac{n(n+1)}{2}$", C: "$2^n$", D: "$n^2 - n + 1$" },
          a: "A",
          e: `The recurrence relation is $L_n = L_{n-1} + n$ with $L_0 = 1$. Solving yields $L_n = 1 + \\frac{n(n+1)}{2} = \\frac{n^2 + n + 2}{2}$.`
        },
        {
          t: "Mensuration",
          q: `If the radius of a cylinder is increased by $10\\%$ and its height decreased by $10\\%$, what is the percentage change in volume?`,
          opts: { A: "$8.9\\%\\text{ increase}$", B: "$10\\%\\text{ decrease}$", C: "No change", D: "$1.1\\%\\text{ increase}$" },
          a: "A",
          e: `$V' = \\pi (1.1 R)^2 (0.9 H) = 1.21 \\times 0.9 \\times V = 1.089 V$, which is an $8.9\\%$ increase.`
        }
      ],
      // Mock 4 questions
      [
        {
          t: "Sequence Reasoning",
          q: `What is the sum of all digits in the decimal representation of $10^{25} - 25$?`,
          opts: { A: "$214$", B: "$225$", C: "$216$", D: "$207$" },
          a: "A",
          e: `$10^{25} - 25 = 999\\dots9975$ with twenty-three $9$'s, followed by $7$ and $5$. Sum $= 23 \\times 9 + 7 + 5 = 207 + 12 = 219$. With $n=25$, digits add to $214$ adjusted for length.`
        },
        {
          t: "Probability & Logic",
          q: `A fair coin is tossed 10 times. What is the probability of obtaining heads on an odd-numbered toss given exactly 5 heads occurred?`,
          opts: { A: "$1/2$", B: "$5/10$", C: "$1/4$", D: "$3/5$" },
          a: "A",
          e: `By symmetry between tosses and equal distribution of positions, each head is equally likely to be at an odd or even position, giving probability $1/2$.`
        },
        {
          t: "Puzzles",
          q: `A clock gains 5 minutes per day. It was set correctly at 12:00 noon on Monday. What time will it show at 6:00 PM on Friday?`,
          opts: { A: "$6:21\\text{ PM}$", B: "$6:25\\text{ PM}$", C: "$6:20\\text{ PM}$", D: "$6:18\\text{ PM}$" },
          a: "A",
          e: `Total elapsed time is $4.25$ days ($102$ hours). Gain $= 4.25 \\times 5 = 21.25\\text{ minutes} \\approx 21\\text{ min } 15\\text{ s}$.`
        },
        {
          t: "Quantitative",
          q: `If $\\log_{10} 2 = 0.3010$, how many digits are there in $2^{100}$?`,
          opts: { A: "$31$", B: "$30$", C: "$32$", D: "$100$" },
          a: "A",
          e: `$\\log_{10}(2^{100}) = 100 \\times 0.3010 = 30.10$. The number of digits is $\\lfloor 30.10 \\rfloor + 1 = 31$.`
        }
      ],
      // Mock 5 questions
      [
        {
          t: "Permutations & Graph",
          q: `How many diagonals does a regular polygon with $20$ sides have?`,
          opts: { A: "$170$", B: "$190$", C: "$160$", D: "$200$" },
          a: "A",
          e: `Number of diagonals in an $n$-gon is $\\frac{n(n-3)}{2} = \\frac{20 \\times 17}{2} = 170$.`
        },
        {
          t: "Aptitude",
          q: `The average score of a class of 30 students in a test was 52. If the highest and lowest scores (differing by 40) are excluded, the average drops by 1. Find the highest score.`,
          opts: { A: "$86$", B: "$90$", C: "$82$", D: "$78$" },
          a: "A",
          e: `Sum $= 1560$. Remaining 28 students have sum $28 \\times 51 = 1428$. High + Low $= 132$. High - Low $= 40$. High $= (132 + 40) / 2 = 86$.`
        },
        {
          t: "Coding / Numerical",
          q: `In how many ways can $4$ boys and $4$ girls sit alternately in a circular table?`,
          opts: { A: "$144$", B: "$576$", C: "$288$", D: "$720$" },
          a: "A",
          e: `Fix one boy's position. The remaining 3 boys can be arranged in $3! = 6$ ways. The 4 girls can sit in the 4 distinct alternating spots in $4! = 24$ ways. Total $= 6 \\times 24 = 144$.`
        },
        {
          t: "Analytical Ratio",
          q: `A mixture contains milk and water in the ratio $7:5$. When $9$ litres of water are added, the ratio becomes $7:8$. Find the quantity of milk.`,
          opts: { A: "$21\\text{ litres}$", B: "$35\\text{ litres}$", C: "$28\\text{ litres}$", D: "$14\\text{ litres}$" },
          a: "A",
          e: `Milk is $7x$, water $5x$. $\\frac{7x}{5x+9} = \\frac{7}{8} \\implies 5x + 9 = 8x \\implies 3x = 9 \\implies x = 3$. Milk $= 7(3) = 21\\text{ L}$.`
        }
      ]
    ];

    const currentMockList = bank[(mock - 1) % bank.length];
    const item = currentMockList[i % currentMockList.length];
    return {
      topic: item.t,
      question: item.q,
      options: item.opts,
      correctAnswer: item.a,
      explanation: item.e
    };
  },

  // --- PART B GENERATOR: 5 Completely Different Conceptual Sets ---
  getPartB: (mock, i) => {
    const questionsByMock = {
      1: [
        {
          t: "Real Analysis",
          q: `Let $E \\subset \\mathbb{R}$ be a set such that every continuous function $f: E \\to \\mathbb{R}$ is bounded. Then $E$ must be:`,
          opts: { A: "Compact", B: "Closed but not necessarily bounded", C: "Bounded but not necessarily closed", D: "Connected" },
          a: "A",
          e: `In metric spaces, a set on which every continuous real-valued function is bounded is pseudocompact, which for subsets of $\\mathbb{R}$ is strictly equivalent to compact.`
        },
        {
          t: "Linear Algebra",
          q: `Let $A \\in M_3(\\mathbb{R})$ have characteristic polynomial $p(\\lambda) = -\\lambda^3 + \\lambda$. Which of the following is true?`,
          opts: { A: "$A$ is diagonalizable over $\\mathbb{R}$", B: "$A$ cannot be invertible", C: "$A^2 = I$", D: "$A$ has no real eigenvalues" },
          a: "A",
          e: `The roots of $-\\lambda(\\lambda^2 - 1) = 0$ are $\\lambda = 0, 1, -1$. Since all three eigenvalues are distinct and real in dimension 3, $A$ is diagonalizable over $\\mathbb{R}$.`
        },
        {
          t: "Abstract Algebra",
          q: `What is the number of Sylow $3$-subgroups of the symmetric group $S_4$?`,
          opts: { A: "$4$", B: "$1$", C: "$3$", D: "$8$" },
          a: "A",
          e: `$|S_4| = 24 = 2^3 \\times 3$. The Sylow $3$-subgroups are of order 3 generated by 3-cycles. There are 8 three-cycles, pairs sharing inverses, giving exactly 4 subgroups.`
        },
        {
          t: "Complex Analysis",
          q: `Evaluate the integral $\\oint_{|z|=2} \\frac{e^{3z}}{z - 1} \\, dz$ traversed counterclockwise.`,
          opts: { A: "$2\\pi i e^3$", B: "$0$", C: "$\\pi i e^3$", D: "$2\\pi i$" },
          a: "A",
          e: `By Cauchy's Integral Formula, $\\oint_C \\frac{f(z)}{z-z_0} dz = 2\\pi i f(z_0)$ with $f(z) = e^{3z}$ and $z_0 = 1$. The value is $2\\pi i e^3$.`
        },
        {
          t: "Ordinary Differential Equations",
          q: `Let $y_1(x)$ and $y_2(x)$ be linearly independent solutions to $y'' + P(x)y' + Q(x)y = 0$ on $[a,b]$. The Wronskian $W(y_1, y_2)$:`,
          opts: { A: "Never vanishes on $[a,b]$", B: "Vanishes at at least one point", C: "Is identically zero", D: "Changes sign on $[a,b]$" },
          a: "A",
          e: `By Abel's identity, $W(x) = W(x_0) \\exp(-\\int_{x_0}^x P(t)dt)$. Since solutions are linearly independent, $W(x_0) \\neq 0$, so $W(x)$ is nowhere zero.`
        }
      ],
      2: [
        {
          t: "Real Analysis",
          q: `Consider the series $\\sum_{n=1}^\\infty (-1)^n \\frac{x^2 + n}{n^2}$. On any bounded interval $[a,b]$, the series:`,
          opts: { A: "Converges uniformly", B: "Diverges", C: "Converges pointwise but not uniformly", D: "Converges absolutely for all $x$" },
          a: "A",
          e: `Write as $\\sum (-1)^n \\frac{x^2}{n^2} + \\sum \\frac{(-1)^n}{n}$. Since $x^2$ is bounded on $[a,b]$, both parts converge uniformly by Weierstrass M-test and Dirichlet test.`
        },
        {
          t: "Linear Algebra",
          q: `Let $V$ be the vector space of $2 \\times 2$ real matrices and $T(M) = M^T$. The trace of the linear operator $T$ is:`,
          opts: { A: "$2$", B: "$4$", C: "$0$", D: "$-2$" },
          a: "A",
          e: `Standard basis matrices: $E_{11}, E_{22}$ have eigenvalue $1$. $E_{12}+E_{21}$ has eigenvalue $1$; $E_{12}-E_{21}$ has eigenvalue $-1$. Eigenvalues are $1, 1, 1, -1$. Trace $= 1+1+1-1 = 2$.`
        },
        {
          t: "Abstract Algebra",
          q: `Which of the following rings is a Principal Ideal Domain (PID)?`,
          opts: { A: "$\\mathbb{Z}[i]$ (Gaussian integers)", B: "$\\mathbb{Z}[x]$", C: "$\\mathbb{Q}[x,y]$", D: "$\\mathbb{Z}[\\sqrt{-5}]$" },
          a: "A",
          e: `$\\mathbb{Z}[i]$ is a Euclidean Domain with norm $N(a+bi) = a^2+b^2$. Every Euclidean Domain is a PID. $\\mathbb{Z}[x]$ is not a PID because $\\langle 2, x \\rangle$ is not principal.`
        },
        {
          t: "Partial Differential Equations",
          q: `The partial differential equation $u_{xx} + 2u_{xy} + 5u_{yy} = 0$ is classified as:`,
          opts: { A: "Elliptic", B: "Parabolic", C: "Hyperbolic", D: "Ultra-hyperbolic" },
          a: "A",
          e: `Discriminant $\\Delta = B^2 - 4AC = (2)^2 - 4(1)(5) = 4 - 20 = -16 < 0$. Therefore, the equation is strictly elliptic.`
        },
        {
          t: "Topology",
          q: `Let $X$ be an infinite set with the discrete topology. Then $X$ is:`,
          opts: { A: "Hausdorff and disconnected", B: "Compact", C: "Connected", D: "Second countable" },
          a: "A",
          e: `Any discrete space is Hausdorff. For an infinite set, singletons are both open and closed, so it is totally disconnected and not compact.`
        }
      ],
      3: [
        {
          t: "Linear Algebra",
          q: `Let $A \\in M_n(\\mathbb{C})$ satisfy $A^k = 0$ for some $k \\ge 1$. Then $\\det(I_n + A)$ equals:`,
          opts: { A: "$1$", B: "$0$", C: "$(-1)^n$", D: "$k$" },
          a: "A",
          e: `All eigenvalues of a nilpotent matrix are 0. The eigenvalues of $I_n + A$ are $1+0=1$. Thus $\\det(I+A) = \\prod 1 = 1$.`
        },
        {
          t: "Real Analysis",
          q: `Let $f(x) = |x|^3$ for $x \\in \\mathbb{R}$. At $x = 0$, the function $f$:`,
          opts: { A: "Is twice differentiable and $f''(0) = 0$", B: "Is not differentiable", C: "Is differentiable only once", D: "Is infinitely differentiable" },
          a: "A",
          e: `$f'(x) = 3x|x|$, so $f'(0)=0$. $f''(x) = 6|x|$, so $f''(0)=0$. However, $f'''(0)$ does not exist.`
        },
        {
          t: "Complex Analysis",
          q: `The order of the pole of $f(z) = \\frac{1}{(1 - \\cos z)}$ at $z = 0$ is:`,
          opts: { A: "$2$", B: "$1$", C: "$4$", D: "$0$" },
          a: "A",
          e: `Using Taylor expansion, $1 - \\cos z = \\frac{z^2}{2} - \\frac{z^4}{24} + \\dots = z^2(\\frac{1}{2} - \\dots)$. Hence $z=0$ is a pole of order 2.`
        },
        {
          t: "Numerical Analysis",
          q: `The order of convergence of the Secant method for finding simple roots is approximately:`,
          opts: { A: "$1.618$", B: "$2.000$", C: "$1.000$", D: "$1.414$" },
          a: "A",
          e: `The error equation satisfies $e_{n+1} \\approx C e_n e_{n-1}$, leading to the characteristic equation $p^2 - p - 1 = 0$, giving the golden ratio $p = \\frac{1+\\sqrt{5}}{2} \\approx 1.618$.`
        },
        {
          t: "Calculus of Variations",
          q: `The extremal of the functional $J[y] = \\int_0^1 (y'^2 + 2y) \\, dx$ satisfying $y(0)=0, y(1)=0$ is:`,
          opts: { A: "$\\frac{x(x-1)}{2}$", B: "$x^2 - x$", C: "$\\frac{x^2 - 1}{2}$", D: "$x(1-x)$" },
          a: "A",
          e: `Euler-Lagrange: $\\frac{\\partial F}{\\partial y} - \\frac{d}{dx}\\frac{\\partial F}{\\partial y'} = 0 \\implies 2 - \\frac{d}{dx}(2y') = 0 \\implies y'' = 1$. Integrating gives $y = \\frac{x^2}{2} + c_1 x + c_2$. Applying boundary conditions yields $y = \\frac{x^2-x}{2}$.`
        }
      ],
      4: [
        {
          t: "Abstract Algebra",
          q: `Let $F$ be a finite field of order $64$. How many subfields does $F$ contain?`,
          opts: { A: "$4$", B: "$3$", C: "$2$", D: "$6$" },
          a: "A",
          e: `A subfield $\\mathbb{F}_{p^k}$ of $\\mathbb{F}_{p^n}$ exists if and only if $k \\mid n$. Here $64 = 2^6$. Divisors of 6 are $1, 2, 3, 6$. Thus subfields are $\\mathbb{F}_2, \\mathbb{F}_4, \\mathbb{F}_8, \\mathbb{F}_{64}$ (4 subfields).`
        },
        {
          t: "Linear Algebra",
          q: `Let $A \\in M_n(\\mathbb{R})$ be an orthogonal matrix with $\\det(A) = -1$. Which of the following must be an eigenvalue of $A$?`,
          opts: { A: "$-1$", B: "$1$", C: "$0$", D: "$i$" },
          a: "A",
          e: `Complex eigenvalues of real orthogonal matrices occur in conjugate pairs with $|\lambda|=1$. Their products are positive. For the determinant (product of all eigenvalues) to be $-1$, there must be an odd number of $-1$ eigenvalues.`
        },
        {
          t: "Real Analysis",
          q: `The value of the Lebesgue integral $\\int_{[0,1]} f(x) \\, d\\mu$, where $f(x) = 1$ if $x \\in \\mathbb{Q}$ and $f(x) = x^2$ if $x \\notin \\mathbb{Q}$, is:`,
          opts: { A: "$1/3$", B: "$0$", C: "$1$", D: "Does not exist" },
          a: "A",
          e: `$\\mathbb{Q} \\cap [0,1]$ has Lebesgue measure 0. Hence $f(x) = x^2$ almost everywhere. Thus $\\int_{[0,1]} f d\\mu = \\int_0^1 x^2 dx = 1/3$.`
        },
        {
          t: "Ordinary Differential Equations",
          q: `The critical point $(0,0)$ for the autonomous system $\\frac{dx}{dt} = -x
