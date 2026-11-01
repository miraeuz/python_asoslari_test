# Python Academy – Application 2: Python Asoslari Exam Platform

A production-ready exam app for the **Python Asoslari** course: 3 timed parts —
**50 + 50 questions** drawn from a 200-question bank and **20 real-life practical
problems** solved in a real in-browser Python. The interface is in Uzbek.

React 18 · Vite · TypeScript · Tailwind CSS + shadcn/ui · Framer Motion · Zustand · Shiki · Pyodide

---

## Quick start

```bash
npm install        # also copies the offline Python runtime into public/pyodide
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # serve the production build locally
```

Requires **Node.js 18+**. The build in `dist/` is fully static — host it on any
web server (Nginx, Netlify, Vercel, GitHub Pages, a school intranet). No backend
and no internet connection are needed during the exam.

---

## What's inside

| Screen | Highlights |
|---|---|
| **Welcome** | Animated hero, exam structure at a glance, rules, student sign-in (name, surname, group), magnetic “Start” button, *resume unfinished exam* card. |
| **Exam** | Sticky glass header (logo · current part · live timer · progress ring · remaining count · autosave status · theme). Collapsible navigator sidebar on desktop, drag-to-dismiss bottom sheet on mobile. VS Code–style code blocks (Light+/Dark+, line numbers, copy). Option cards with animated selection. Bottom action bar: Previous · Mark · Clear · Submit part · Next. |
| **Question types** | Single choice, multiple choice, true/false, fill-in-the-blank, “what is the output?” (terminal-style answer). |
| **Part transition** | Confirmation dialog with answered / unanswered / marked counts and one-click jumps → cinematic transition page → next part's timer starts only when the student presses *Start*. |
| **Part 3 – practical problems** | Statement with example input/output, a real code editor (Python highlighting, Tab/Shift+Tab, auto-indent, Esc→Tab to leave), stdin panel, **Run** (Ctrl+Enter) using Pyodide in a Web Worker, comparison with the expected output, infinite-loop protection. |
| **Final review** | All three parts with status, remaining time, unanswered and marked questions — click any to jump back (if that part still has time). Submit with a checkbox + press-and-hold button. |
| **Results** | Animated score ring, grade, confetti on pass, per-part breakdown, per-topic strengths/weaknesses, question-by-question review with your answer, correct answer and explanation. Practical solutions are run against the example automatically. Export JSON · print. |

**Reliability:** autosave to `localStorage` every 3 s (and instantly when the tab
is hidden/closed), leave-page warning during the exam, resume after reload,
per-part timers that keep running if the page is closed, automatic part
submission when time runs out.

**Accessibility:** full keyboard control (`←/→`, `A–D` / `1–4`, `T/F`, `M`,
`Del`, `N`, `?`), visible focus rings, focus moves to each new question,
screen-reader labels and live regions, Radix dialogs with focus trapping,
`prefers-reduced-motion` respected, large touch targets (44px navigator cells and action buttons), safe-area aware mobile bar.

---

## Configuration — `src/config/exam.config.ts`

Everything about the exam lives in one file:

```ts
parts: [
  { id: "p1", title: "1-qism", kind: "questions", count: 50, durationMinutes: 60,
    pool: { topicNumbers: ["2.1", …, "2.8"] }, points: 1 },
  { id: "p2", title: "2-qism", kind: "questions", count: 50, durationMinutes: 60,
    pool: { topicNumbers: ["2.9", …, "2.16"] }, points: 1 },
  { id: "p3", title: "3-qism", kind: "problems",  count: 20, durationMinutes: 60,
    pool: "all", points: 2 },
],
shuffleQuestions: true,           // seeded per attempt — stable across reloads
shuffleOptions: true,             // letters are re-labelled, grading uses bank keys
stratifyByTopic: true,            // every topic gets a proportional share
allowReturnToSubmittedParts: true,
passPercent: 60,
autosaveIntervalMs: 3000,
collectStudentInfo: true,
revealAnswersInResults: true,
python: { enabled: true, indexURL: "bundled", timeoutMs: 8000 },
```

* **Change the number of parts:** add, remove or reorder entries in `parts`.
  Each part needs a unique `id`. Use `kind: "questions"` or `kind: "problems"`.
* **Choose which topics a part draws from:** `pool: { topicNumbers: [...] }`
  (numbers come from the bank's `topics_distribution` keys such as
  `"2.13 Satr metodlari"`), `pool: { topics: ["Satr metodlari"] }`, or `pool: "all"`.
* **Python runtime:** `"bundled"` serves Pyodide from `public/pyodide` (offline).
  You may instead set a CDN URL, e.g. `"https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"`.

> If you change the number of parts, previously saved attempts are discarded
> automatically instead of crashing.

---

## Replacing the question bank

1. Put your bank at **`src/data/questions.json`** (same shape as the included 200-question bank):

```jsonc
{
  "meta": { "course": "…" },
  "topics_distribution": { "2.1 Sintaksis va chekinish": 8, … },   // optional, enables topic numbers
  "questions": [{
    "id": 1, "topic": "Sintaksis va chekinish",
    "type": "single_choice | multiple_choice | true_false | fill_blank | output",
    "difficulty": "easy | medium | hard",
    "question": "Text… may contain `inline code`, **bold** and a ```python fenced block```",
    "code": "optional python code (rendered in the VS Code block)",
    "options": ["A) …", "B) …"],                // choice types only
    "correct_answer": "B" | ["A","C"] | "True" | "exact text",
    "explanation": "…"
  }],
  "practical_problems": [{
    "id": 1, "title": "…", "description": "…",
    "input_example": "…", "output_example": "…",
    "topics_used": ["…"], "difficulty": "medium | hard"
  }]
}
```

2. Validate it: `npm run validate:bank` (or `npm run validate:bank -- path/to/bank.json`).
3. Rebuild. Pool sizes are checked at runtime — a part never asks for more items than exist.

**Grading rules**

| Type | Correct when |
|---|---|
| `single_choice`, `true_false` | the chosen key equals `correct_answer` |
| `multiple_choice` | the chosen set equals the correct set exactly (all-or-nothing) |
| `fill_blank` | text matches after trimming and collapsing spaces |
| `output` | lines match after removing trailing spaces and trailing blank lines (leading spaces matter) |
| practical problem | the solution's output for `input_example` matches `output_example` (same normalisation) |

Practical-problem scores are **provisional** — the results page says so; a teacher
can review the exported JSON, which contains every answer and every solution.

---

## Theming

* Light / dark / system modes, plus three academy palettes (**Indigo**, **Mirae**, **Oʻrmon**) — switch from the sun/moon menu.
* All colours are HSL tokens in `src/index.css`. To add an academy palette, copy a
  `[data-palette="…"]` block (and its `.dark[...]` twin), then add it to
  `palettes` in `src/store/prefsStore.ts`.
* Code colours come from the real VS Code **Light+** and **Dark+** themes.
* Fonts (Inter, JetBrains Mono) are bundled — no external requests.

---

## Project structure

```
python-academy-exam/
├─ index.html                     # theme bootstrap (no flash), meta
├─ public/
│  ├─ favicon.svg
│  └─ pyodide/                    # generated on install (git-ignored)
├─ scripts/
│  ├─ copy-pyodide.mjs            # copies the offline Python runtime
│  └─ validate-bank.mjs           # bank validator
└─ src/
   ├─ App.tsx                     # phase router + page transitions
   ├─ main.tsx
   ├─ index.css                   # design tokens, palettes, base styles
   ├─ config/exam.config.ts       # ← all exam settings
   ├─ data/
   │  ├─ questions.json           # ← the 200-question bank + 20 problems
   │  ├─ schema.ts                # types + normalisation
   │  └─ bank.ts
   ├─ store/
   │  ├─ examStore.ts             # attempt state machine (Zustand)
   │  └─ prefsStore.ts            # theme, palette, sidebar
   ├─ lib/
   │  ├─ selection.ts             # seeded, topic-stratified drawing
   │  ├─ grading.ts · results.ts  # scoring, per-part & per-topic results
   │  ├─ python.ts · python.worker.ts   # Pyodide runner with timeouts
   │  ├─ highlighter.ts           # Shiki (fine-grained, Python only)
   │  └─ random.ts · format.ts · utils.ts
   ├─ hooks/                      # autosave, leave guard, theme, hotkeys, timers
   ├─ components/
   │  ├─ ui/                      # shadcn-style primitives (button, dialog, sheet, …)
   │  ├─ code/                    # CodeBlock, CodeEditor, RichText
   │  ├─ exam/                    # header, timer, navigator, question & answer inputs, dialogs
   │  ├─ problems/                # practical problem workspace
   │  ├─ results/                 # score hero, breakdowns, review list
   │  └─ brand/
   └─ screens/                    # Welcome, Exam, Transition, Review, Results
```

**State model.** One `Attempt` object holds the seed, drawn item ids, option
order, per-part timers (`remainingMs` + `activeSince`), answers, marks, code and
runs. Results are *derived* from it (never stored separately), so a reload
always shows consistent scores.

---

## Deployment notes

* Static hosting under a sub-path: build with `npx vite build --base=/exam/`.
* `localStorage` is per browser — each student should use their own device/profile.
  Use **Export JSON** on the results page to collect results.
* The app works offline after the first load as long as the files stay cached;
  for exam rooms, serve `dist/` from a local server.
