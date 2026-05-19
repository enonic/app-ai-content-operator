Enonic XP application. Gradle project: TypeScript, React 19, Tailwind CSS v3.

## Scripts

After making changes, run `pnpm run check` to verify nothing is broken.

- **Verify changes**: `pnpm run check`
- **Lint-fix**: `pnpm run fix`
- **Run tests**: `pnpm run test`
- **Build + deploy**: `./gradlew deploy -x test -Penv=dev`

Only run Gradle when the task specifically requires it. For most changes, `pnpm run check` is sufficient.

## Git & GitHub

No conventional commit prefixes. Plain descriptive language throughout.

### Issues

- **Title**: plain descriptive text — e.g. `Add schedule button to PublishDialog`, `Fix Gemini timeout on large prompts`
- **Body**: concisely explain what and why, skip trivial details

### Commits

- **With issue**: `<Issue Title> #<number>` — e.g. `Migrate to ESLint 9 #623`
- **Without issue**: capitalized plain-English description — e.g. `Fix genai dependencies Jest incompatibility`
- **Body** (optional): past tense, one line per change, 2–6 lines, backticks for code refs

### Pull Requests

- **Title**: `<Issue Title> #<number>` — matches the commit title
- **Body**: concisely explain what and why, skip trivial details. No emojis. Separate sections with one blank line.

  ```
  <summary of changes>

  Closes #<number>
  ```
