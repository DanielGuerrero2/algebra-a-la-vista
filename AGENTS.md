# Repository Guidelines

## Project Structure & Module Organization

Álgebra a la vista is a Spanish-language relational algebra laboratory built with Preact, Vite, and Tailwind CSS. It runs entirely in the browser and deploys as a static site.

- `src/core/`: query interpreter (`engine.js`), expression builder/comparison (`lab-model.js`), and session reducer (`session.js`).
- `src/components/`: JSX interface components; `src/hooks/useWorkspace.js` coordinates state and persistence.
- `src/data/`: example relations, exercises, and task descriptions. `src/styles.css` defines theme tokens and custom styles.
- `tests/`: automated tests; `tests/fixtures/expected-results.json`: independent reference results.
- `public/assets/brand/` and `public/assets/illustrations/`: optimized resources used by the site; `assets/originals/`: source images kept out of the build.
- `docs/funcionamiento.md`: architecture and maintenance details; `CONTRIBUTING.md`: local setup and contribution guide.
- `dist/`: generated build output. Edit source files, never this directory directly.

## Build, Test, and Development Commands

Run commands from the repository root with Node.js 22.12+ and npm:

- `npm ci`: install dependencies from `package-lock.json`.
- `npm run dev`: start Vite with live updates, usually at `http://localhost:5173`.
- `npm test`: run engine, regression, builder, and session checks.
- `npm run build`: generate the production site in `dist/`.
- `npm run preview`: serve the production build for local review.

## Coding Style & Naming Conventions

Use JavaScript ES modules, single quotes, semicolons, and two-space indentation in expanded code. Match surrounding formatting; avoid unrelated reformatting of compact files. Use PascalCase for component filenames, camelCase for functions and variables, and `use` prefixes for hooks. Follow existing Preact JSX conventions, including `class` attributes. Keep interface text in Spanish. Reuse Tailwind theme tokens from `src/styles.css`. No formatter or lint script is configured.

## Testing Guidelines

Tests use Node's strict assertions; session tests use `node:test`. Follow the existing `test-<area>.cjs` or `.mjs` naming pattern. Add regression cases for changed behavior. Preserve independent expected results rather than regenerating them from the interpreter. No coverage threshold is configured.

Before submitting code changes, run `npm test` and `npm run build`. For UI changes, check 320, 768, 1024, and 1440 px widths, keyboard navigation, undo/redo, and invalid expressions.

## Commit & Pull Request Guidelines

This distribution omits Git history, so historical commit conventions cannot be verified. Use concise imperative subjects, such as `Fix projection validation`. Keep changes focused. PRs should explain the behavior change, link relevant issues, report verification results, and include screenshots for visual changes.

## Persistence & Data Boundaries

For page illustrations, follow `docs/estilo-imagenes.md`.

Keep original example relations immutable and preserve compatibility with existing browser storage keys. Interpret queries through the parser without JavaScript evaluation. Update documentation when syntax, exercises, or persistence behavior changes.
