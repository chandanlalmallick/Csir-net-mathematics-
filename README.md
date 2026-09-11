# CSIR-NET Mathematical Sciences — Full-Length Mock Simulator

A production-ready static mock exam platform designed to replicate the NTA CSIR-NET Mathematical Sciences examination format.

## Key Features

- **5 Full-Length Mock Tests**: 130 questions each (650 genuine mathematical questions total).
- **Accurate CSIR-NET Exam Pattern**:
  - **Part A (General Aptitude)**: 20 Questions | Max Attempt: 15 | $+2.0$ marks, $-0.50$ negative.
  - **Part B (Mathematical Sciences MCQ)**: 40 Questions | Max Attempt: 25 | $+3.0$ marks, $-0.75$ negative.
  - **Part C (Mathematical Sciences MSQ)**: 70 Questions | Max Attempt: 20 | $+4.0$ marks, $0.00$ negative | Multiple checkboxes.
  - **Total Attempts Enforced**: Exactly 60 questions maximum across the paper.
- **MathJax 3 Integration**: Renders LaTeX formulas, matrices, integrals, summation notation, and topological symbols cleanly.
- **Session Persistence**: Timer and question responses survive accidental browser reloads via `localStorage`.
- **Diagnostic Analytics**: Section-wise score reporting, accuracy tracking, and topic mastery recommendations.
- **Mobile-Friendly**: Collapsible question palette and responsive layouts for Android and iOS browsers.
- **Zero Dependencies**: Pure HTML5, CSS3, and vanilla JavaScript without any backend or build steps.

---

## Deploy to GitHub Pages in 3 Steps

1. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com) and create a new public repository (e.g., `csir-net-math-mock`).

2. **Upload Files**:
   - Upload the four files directly into the repository root:
     - `index.html`
     - `style.css`
     - `script.js`
     - `README.md`

3. **Enable GitHub Pages**:
   - In your repository, click **Settings** &rarr; **Pages** (in the left sidebar).
   - Under **Build and deployment** &rarr; **Branch**, select `main` (or `master`) and `/ (root)`.
   - Click **Save**.

Your CSIR-NET simulator will be live at:

