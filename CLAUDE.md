# CLAUDE.md

## Project Overview

Svelte Diff Match Patch — a Svelte component library for visual string diffing using the diff-match-patch algorithm. Supports character-level diffing, expected pattern matching with named capture groups, and flexible rendering.

## Coding Style Requirements

- All TypeScript functions must be **arrow functions** (no `function` keyword declarations)
- All exported TypeScript functions must have **Google-style JSDoc** comments
- Use `trunk fmt` and `trunk check` to ensure code formatting and linting compliance before committing

## Build & Test Commands

- `npm run build` — Build the project (vite build + svelte-package + publint)
- `npx vitest run src/lib/` — Run unit tests
- `npx playwright test` — Run E2E tests
- `trunk fmt` — Format files
- `trunk check` — Lint/check files

## Project Structure

- `src/lib/` — Core library source
    - `SvelteDiffMatchPatch.svelte` — Main component
    - `expectedPatterns.ts` — Expected pattern matching algorithm
    - `index.ts` — Public exports and types
- `src/routes/` — Demo/test pages (SvelteKit routes)
- `docs/` — Documentation website
- `tests/` — E2E tests (Playwright)
