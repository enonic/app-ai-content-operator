---
paths:
  - 'src/**'
---

# Structure Rules

## Naming

Folders are kebab-case. A file is named after its primary export:

| Export                    | Casing          | Example                               |
| ------------------------- | --------------- | ------------------------------------- |
| Component, class          | PascalCase      | `UserDialog.tsx`, `LicenseManager.ts` |
| Function, hook            | camelCase       | `injectStyles.ts`, `useToggle.ts`     |
| Multi-export topic module | camelCase topic | `validation.ts`, `constants.ts`       |

Tests and stories mirror the source name and sit beside it
(`Foo.tsx` → `Foo.test.ts`, `Foo.stories.tsx`).

**Dotted names.** Tooling suffixes — `.test.ts`, `.stories.tsx`, `.d.ts`,
`.config.ts` — always. Role suffixes — `.store.ts`, `.types.ts`, `.utils.ts` —
only inside a folder that splits one subject into roles (`<subject>.<role>.ts`).
A standalone module gets no dot: `logger.ts`, not `logger.module.ts`.

## Stores

`store/<name>/` — one folder per store:

- `<name>.store.ts` — state declarations only (atoms, signals, maps,
  computed/derived/batched values)
- `<name>.types.ts` — type definitions
- `<name>.utils.ts` — actions, getters/setters, event handlers
- `index.ts` — barrel; the store's public API

Import via the barrel: `@/store/<name>`.

## Components

`components/<group>/<component>/` (and `ui/`) — one folder per component:

- `ComponentName.tsx` — the component
- `ComponentName.stories.tsx`, `ComponentName.test.ts` — colocated
- sub-components nest as their own folders

No `index.ts`. Import the file directly:
`@/components/<group>/<component>/ComponentName`.

## Barrels

A barrel (`index.ts`) belongs only at a **module boundary** — a folder of
several files that together expose one public surface (a store composes
`.store` + `.utils` + `.types`). A component folder exposes a single file,
so it gets no barrel.

## Grouping

Group modules by domain, not by file-kind — `lib/<service>/` holds its client,
options, and types together, not `lib/clients/` + `lib/types/`. Cross-cutting
helpers go in `utils/`, named by concern (`objects.ts`, `uuid.ts`) — never a
generic `utils.ts`.

Top-level dirs (`components/`, `ui/`, `store/`, `common/`) group by kind today;
a feature-based split may come later — not enforced.
