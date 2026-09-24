# CLAUDE.md — Project Rules

## 1. Never silently clamp invalid input

Do not use `Math.max/Math.min` to rewrite user input before validation. Pass raw values through and let a validation function surface errors. Clamping hides problems from the user and makes it impossible to detect dirty data loaded from the database. Instead, validate first, then display errors, and only allow saving when all fields are valid.

## 2. Extract validation into a pure, testable module

Validation logic must live in `src/lib/validation.ts` as pure functions returning `string | null` (null = valid, string = error message). This makes rules testable without rendering components, serves as executable documentation via the test file, and prevents the component from becoming a tangle of inline checks. Run `npm test` as a verification gate — not just `npm run build`.

## 3. Use useMemo for derived validation state

When form validation depends on form state, compute errors with `useMemo(() => validateSettings(settings), [settings])` rather than storing errors in a separate `useState` and syncing via `useEffect`. The `useEffect` approach introduces an extra render cycle and a state-sync footgun where errors can lag behind the actual field values.

## 4. Verify AI build summaries against the actual files

An AI's description of its own output ("66 tests," "field-level validation") is not evidence that it exists. Before accepting a generated summary, `WORKFLOW.md`, or `CLAUDE.md`, open the real files and check timestamps, diffs, and function bodies. In this project, an AI-written `WORKFLOW.md` described a two-round comparison that hadn't actually happened — caught by checking file timestamps, not by reading the summary.

## 5. Reference exact file paths and field names when iterating on a feature

A prompt naming a feature by topic alone lets the AI invent a new field set each time, even for "the same feature" on a second pass. Always point to the existing component file and list the fields to preserve. In this project, two generations of the same nominal feature shared zero field names.

## 6. Run `git init` immediately after exporting from a browser AI tool

Branches shown inside a browser-based builder (Bolt, similar tools) don't survive a ZIP export — the downloaded folder has no `.git` until you create one. Initialize git before creating any branches, or a branch-based comparison silently collapses into one unversioned folder.

## 7. Verify AI-reported work against ground truth before proceeding

Before starting the next step of any task, check the AI's claim about what it did against the actual evidence — file timestamps, diffs, function bodies, test output — not its written summary. Applies especially when moving between rounds, sessions, or branches: confirm files landed where claimed, changes match what was described, and figures (test counts, line counts) can be independently reproduced. In this project, an AI-written progress report described work that had not happened; it was caught by checking file timestamps, not by reading the report. Testable: for any AI-reported outcome, name the specific file, diff, or command output that confirms it before treating the report as fact.
