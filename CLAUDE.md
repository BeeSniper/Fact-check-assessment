# CLAUDE.md — Project Rules

## 1. Never silently clamp invalid input

Do not use `Math.max/Math.min` to rewrite user input before validation. Pass raw values through and let a validation function surface errors. Clamping hides problems from the user and makes it impossible to detect dirty data loaded from the database. Instead, validate first, then display errors, and only allow saving when all fields are valid.

## 2. Extract validation into a pure, testable module

Validation logic must live in `src/lib/validation.ts` as pure functions returning `string | null` (null = valid, string = error message). This makes rules testable without rendering components, serves as executable documentation via the test file, and prevents the component from becoming a tangle of inline checks. Run `npm test` as a verification gate — not just `npm run build`.

## 3. Pin test framework version to match the build tool

Vitest 5 is incompatible with Vite 5 (breaks on `./module-runner` import). When adding a test framework, verify version compatibility with the existing build tool before installing. Use `vitest@^2` with `vite@^5`. Always run `npm test` after installation to confirm the runner starts, not just after writing test files.

## 4. Use useMemo for derived validation state

When form validation depends on form state, compute errors with `useMemo(() => validateSettings(settings), [settings])` rather than storing errors in a separate `useState` and syncing via `useEffect`. The `useEffect` approach introduces an extra render cycle and a state-sync footgun where errors can lag behind the actual field values.
