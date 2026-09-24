# WORKFLOW.md — Vague vs. Precise Prompt Comparison

## Methodology

The same feature — a settings form for a fact-check assessment tool — was built twice from two different prompt styles, each saved to its own git branch:

- **`round-1-vague-prompt`**: "Build a settings form for a fact-check assessment feature." No constraints, no file references, no verification step.
- **`round-2-precise-prompt`**: Prompt included file references (`FactCheckSettingsForm.tsx`), validation constraints (integer ranges, enum values, domain format rules), example behavior ("disable Save when any field has a validation error"), and an explicit verification step ("write tests, then run them"). Built via an explore-plan-code loop.

## Correctness

Round 1 silently clamps invalid input (`Math.max(1, Math.min(500, parseInt(...) || 1))`), meaning out-of-range values are rewritten behind the user's back. If the database already contains dirty data, the form rewrites it on save without ever surfacing the problem. Round 2 passes raw values through and validates them via a pure `validation.ts` module with 66 tests covering boundary values, NaN, empty strings, and invalid domains. The Save button is disabled when any error is present, and invalid fields show red borders with descriptive error messages.

## Accessibility

Round 1 has no `aria-invalid` attributes and no programmatic error announcement. Round 2 adds `aria-invalid` to every validated input, displays error text with an icon for screen-reader context, and includes a top-level error banner summarizing the form state. Both rounds use `role="switch"` for toggles, which is correct.

## Edge Cases

Round 1 handles exactly zero edge cases — the clamping masks them all. Round 2 explicitly handles: NaN from failed `parseInt`, empty/whitespace domain strings, domains containing spaces, duplicate domain entries (prevents adding), and dirty data loaded from Supabase (validated on load via `useMemo`). The test suite documents every edge case as a named test case.

## Review Effort

Round 1 requires a line-by-line manual review to discover that clamping hides errors, that there are no tests, and that no validation exists. The reviewer must mentally simulate edge cases. Round 2's review is faster: the validation logic lives in one file with a clear API (`string | null` return), the test suite serves as executable documentation of the rules, and the UI changes are mechanical (error display + disabled state). A reviewer can focus on whether the validation rules are correct rather than hunting for missing validation.

## Diff Summary

7 files changed, 887 insertions, 111 deletions. New files: `validation.ts`, `validation.test.ts`, `constants.ts`. The component grew by ~150 lines (error display, `useMemo` validation, `FieldError` component) but shrank in complexity per line because inline clamping was removed.
