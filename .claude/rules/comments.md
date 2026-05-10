---
paths:
  - '**/*.{ts,tsx}'
---

# Comments

## When to comment

Default: no comment, except separators. Add one only when the WHY is genuinely non-obvious — a hidden constraint, a subtle invariant, a workaround for a specific bug, behavior that would surprise a reader. Keep it to 1–2 lines.

Don't explain WHAT the code does — names already do that. Don't reference the current task, fix, issue, or PR (`added for the X flow`, `handles the case from #123`, `fixed during refactor`) — that rots as the code evolves and belongs in the commit message, PR body, or issue, not the source.

## Prefixes

Single-line prefixes. Never combine. Never use `// ----`, `// ====`, or numeric headers (`// ---- 1. Validate ----`).

- `// !` — critical (bug, security risk, breaking change)
- `// ?` — uncertainty, open question, rationale for unusual pattern
- `// *` — section divider; surround with blank `//` lines, header ≤ 4 words
- `// TODO: [#123]` — actionable follow-up, imperative verb, issue ref when one exists

```ts
// ! Potential race condition if fetch retries here
// ? May need to memoize once this call becomes hot
// TODO: [#123] Replace mock with live API

//
// * Event Handlers
//

/* ... */

//
// * Validators
//

/* ... */
```

Use `// *` between subcomponents in composite component files. Delete a `// TODO:` once resolved — don't leave it as a comment.
