# Repository Guidelines

## Project Structure & Module Organization
The SPA runs on Vite + Vue 3; `src/main.js` bootstraps `App.vue`, which coordinates `KeywordManager`, `SearchFilter`, and `Timeline`. Place UI elements in `src/components/`, shared state in `src/composables/`, remote calls in `src/api/dataSourceClient.js`, utilities in `src/utils/`, and design tokens in `src/styles/` consumed by `src/style.css`. Static assets live in `src/assets`, passthrough files stay in `public/`, and keep helpers or tests beside the feature they support.

## Build, Test, and Development Commands
- `npm install` — sync dependencies from `package-lock.json`.
- `npm run dev` — start the Vite dev server with HMR on `http://localhost:5173`.
- `npm run build` — emit optimized assets into `dist/`; run before sharing.
- `npm run preview` — serve the build locally to spot prod-only issues.

## Coding Style & Naming Conventions
Author components as Vue `<script setup>` SFCs with two-space indentation, trailing semicolons, and grouped imports. Use `PascalCase` for components, `use` prefix for composables, camelCase for helpers, and emit events instead of mutating parents. Share spacing, color, and typography variables via `src/styles/globals.css`, then scope component styles. Wrap every API in its own helper under `src/api/` so axios usage stays centralized and mockable.

## Testing Guidelines
Automated tests are not wired up, so exercise new work manually via `npm run dev`, covering loading, error, and empty states, and attach evidence in PRs. When you introduce tests, favor Vitest + Vue Test Utils, name files `ComponentName.spec.js` beside the subject, and mock `src/api/dataSourceClient.js`. Target at least one happy path and one failure path per module; treat ~80% statement coverage as the goal for any new package.

## Commit & Pull Request Guidelines
This archive lacks Git history, so adopt Conventional Commits (`feat(keyword): add bulk toggle`) in present tense with subjects under 72 characters. Pull requests must explain the problem, outline the fix, link the issue, list manual test steps, and include screenshots for UI tweaks. Request review only after `npm run build` succeeds and linting (once available) passes.

## Security & Configuration Tips
External data lives in `src/api/dataSourceClient.js`; source API keys from `.env` files prefixed with `VITE_` and keep them out of version control. Replace the RSS2JSON placeholder key with `import.meta.env.VITE_RSS2JSON_KEY` and throttle refresh actions to respect GitHub, Dev.to, and Hacker News limits. `useLocalStorage` writes immediately, so sanitize user strings and guard browser-only APIs when adding SSR or headless tests.
