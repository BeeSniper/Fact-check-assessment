# WORKFLOW.md — Vague vs. Precise Prompt Comparison

## Methodology

The same feature — a fact-check assessment settings form — was built via two prompt styles, each isolated on its own branch after the fact from a single Bolt session:

- `round-1-vague-prompt`: "Build a settings form for a fact-check assessment feature." One sentence, no constraints, no file references, no verification step. Fields: claim, source, category, confidence, notes.
- `round-2-precise-prompt`: generated in the same Bolt session with more elaborate scope than the drill intended — includes a validation module (`validation.ts`), a test suite (`validation.test.ts`), Supabase persistence, and expanded fields (assessment mode, confidence threshold, source verification level, etc). This round was not produced from the specific file-referenced, constraint-driven prompt drafted for this exercise. Bolt's free-tier daily token allowance was exhausted before that prompt could be run, so an earlier, already-generated elaborate build was adopted as the Round 2 comparator instead.

Round 1 and Round 2 also diverged in field set, since both were generated without an enforced continuity constraint. Round 1 covers claim/source/category/confidence/notes; Round 2 covers assessment mode/confidence threshold/source verification/claim limits/language/excluded domains. This means the comparison below is not a pure "same feature, two prompt styles" diff — it also reflects the AI choosing different scope each time it was prompted vaguely-adjacent to the same topic. That divergence is itself a finding: without file references pinning the AI to an existing field set, even a topically similar prompt produces a structurally different feature.

## Correctness

Round 1 accepts any input, including a fully empty form — tested directly, with every field (claim, source, category, confidence, notes) submitting successfully and showing a fake "saved" alert with no persistence. Round 2 wires `validateSettings()` into a `useMemo` that re-runs on every keystroke, disables Save while any field is invalid (`formHasErrors`), and shows inline errors per field. However, validation strength varies: numeric/enum fields (confidence threshold, claims count, source count) enforce real range and type checks, while `validateDomain()` only checks for a dot and no whitespace — `"a.b"` passes despite not being a real domain.

## Accessibility

Round 1 has no accessibility attributes at all — labels aren't linked to inputs via `htmlFor`/`id`. Round 2 adds `aria-invalid` to every validated input and `role="switch"`/`aria-checked` on toggles, but its `FieldError` component renders plain text with no `role="alert"` or `aria-live` region — a sighted user sees the red text instantly, but a screen reader user gets no announcement when an error appears. Partial improvement, not full compliance.

## Edge Cases

Round 1 handles none — confirmed by testing: empty submit succeeds, malformed email (`flavyuio@`) and malformed URL (`httpsffr sss`) both save without error. Round 2 catches non-integer/out-of-range numeric input (`!Number.isInteger`, including NaN from a cleared field) and rejects domains with whitespace or no dot — but `validateDomain` would still accept a non-real domain like `"a.b"`, so its edge-case coverage is real but incomplete.

## Review Effort

Reverting Round 2's code back to Round 1's baseline deleted 1,107 lines and added 80 — that size difference is itself the review cost: Round 1's correctness could only be judged by manually clicking through and guessing what might break, since there was nothing to read. Round 2's `validation.ts` is a single, isolated module with a consistent return type (`string | null`), so a reviewer can check each rule in isolation rather than hunting through UI code for missing checks.

## AI Mistake Caught

The most significant mistake was not a bug in either build individually, but a scope mismatch across rounds: Round 2 was generated for a different field set than Round 1 (no `claim`, `source`, or `notes` field carried over; new fields like `assessment_mode` and `excluded_domains` appeared instead), which was only caught by manually diffing file contents and timestamps rather than trusting the AI's own summary of what it built. A secondary mistake: Round 2's `validateDomain()` accepts any string containing a dot and no whitespace as a valid domain — `"a.b"` or `"x.y.z.q"` pass, despite not being real domains — a gap only visible by reading the validation source directly, not from the UI or from the AI's description of its own work.

## Diff Summary

Reverting `round-2-precise-prompt` back to a bare baseline (`round-1-vague-prompt`) removed `src/lib/validation.ts`, `src/lib/validation.test.ts`, `src/lib/supabase.ts`, `src/types/settings.ts`, and a Supabase migration file — 6 files changed, 80 insertions, 1,107 deletions.
