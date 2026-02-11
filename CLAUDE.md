# AI Content Operator

Enonic XP application. Gradle project: TypeScript, React, Tailwind CSS v3.

## Commands

pnpm scripts (preferred for TS/JS work):

    pnpm run check         # typecheck + lint
    pnpm run fix           # lint with auto-fix
    pnpm run format        # format code
    pnpm run test          # run all tests with coverage
    pnpm run test:client   # run client (browser) tests only
    pnpm run test:server   # run server (node) tests only

Gradle (full build cycle, or when Java/Gradle config changes):

    ./gradlew build          # Full build with tests
    ./gradlew build -x test  # Build without tests

## Critical Constraints

- React 19 (not Preact)
- Target: ESNext
- TypeScript required for all code
- Client code: `src/main/resources/assets/`
- Server code: `src/main/resources/lib/`
- Shared code: `src/main/resources/shared/`
- Localization: `src/main/resources/assets/i18n/locales/`
- Build: Vite (client) + tsup (server), orchestrated by Gradle
- Tailwind CSS scoped under `.ai-content-operator` class

## External Docs

Use Context7 MCP for React, Tailwind CSS v3, Gradle documentation.
