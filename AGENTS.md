# Two Perspectives

This is the independent React/Vite/Tailwind app, not the original ART351 classroom demo. Use this checkout. Do not create a Git worktree unless the user requests one, and do not merge this project into the classroom repository.

Use Node 24. Install with `npm ci`; start with `npm run dev`. Run `npm test` and `npm run build` for relevant application changes. Browser scripts are optional and require Python Playwright/Chromium; see README.md.

Keep participant nicknames, choices, reflections, and drawings in local React state. Do not add response uploads, persistence, analytics, login, or a backend unless the user changes those requirements. Reset/end must clear responses, and unfinished responses must stay hidden during handoffs.

Keep seed scenarios in `src/data.js`. Preserve keyboard controls, labels, visible focus, mobile layouts, and reduced-motion support. The wording check is a limited classroom placeholder, not moderation or counseling.

Catalog requests use fixed public queries only. Keep OAuth secrets and other credentials out of browser code and `VITE_` variables. Handle timeouts, errors, and invalid data with explicit preset labels. iTunes search suggestions are not current popularity rankings. Do not describe mocked API checks as successful live API checks.

Source and lockfiles belong in Git. Keep `node_modules/`, `dist/`, local `.env` files, browser profiles, and temporary test outputs out of commits. Do not publish environment changes or deploy the app unless requested.
