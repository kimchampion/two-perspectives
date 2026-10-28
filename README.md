# Two Perspectives

A React + Vite + Tailwind CSS prototype for two people exploring fictional scenarios. This is the full four-card app, with private participant handoffs, paired reveals, before/after reflection, and a session summary. It is an independent project; the original ART351 classroom demo belongs in its own repository.

## Run on your computer

Install Node.js 24, then run these commands from the project folder (the one containing `package.json`):

```sh
npm ci
npm run dev
```

Open the address Vite prints in your terminal. The app requires no account, database, backend, API key, or `.env` file. Public catalogs may fail because of networking or browser restrictions; labeled presets remain usable. An `.nvmrc` file selects Node 24 for people using nvm.

## Open in Codex desktop

1. Clone this repository to your computer with GitHub Desktop or `git clone YOUR_REPOSITORY_URL`.
2. Open that local `two-perspectives` folder in Codex desktop as a project.
3. Ask Codex to read this README and `AGENTS.md`, run `npm ci`, and start `npm run dev`.

Cloning configures the GitHub repository as `origin`. GitHub handles version history; the app runs locally. A GitHub repository alone does not host the app as a website.

Keep this project in its own folder. Do not copy it over the original classroom demo or use the classroom repository as its remote.

## Useful commands

```sh
npm test
npm run build
npm run preview
```

`npm test` runs 12 unit tests. The production build goes into `dist/`. `npm run preview` serves the built app locally.

To produce an HTML file with the app, styles, and fonts embedded:

```sh
npm run build:standalone
```

Open `dist/Two-Perspectives.html` in a browser. This file can run with presets offline. Live catalog requests still need internet access. The regular `dist/index.html` requires an HTTP server.

Two optional export scripts also require Python 3:

```sh
npm run build:copyable
npm run package:files
```

The copyable edition is generated from a repository-contained template and written to `dist/Two-Perspectives-copyable.html`. It needs internet access initially to load its React/Tailwind/Babel libraries. The package command writes a source ZIP and standalone HTML under `dist/releases/`. Both Python scripts accept an optional `--output` path; they no longer require a cloud workspace.

`examples/creative-test.html` is the separate, focused creative-feature test page. It does not include all four cards of the full app.

## Try the app

1. Create a session and enter different nicknames for two people, or select **Just exploring? Try demo nicknames**. The nickname form reads visible input values, including browser autofill.
2. Pick a fictional scenario, acknowledge the ground rules, and begin.
3. Pass the device at each handoff. Both participants must submit before a reveal appears.
4. Choose colors, song titles, preset symbols, or a mouse/pen/touch drawing on either creative card. Then explore character perspectives, paths, and reflections.
5. Pause, restart, or end. Ending or refreshing clears all participant responses. No agreement is required.

Session codes and the QR placeholder demonstrate the intended flow; they do not connect separate devices. Same-device hiding is a turn-taking convention, not secure storage.

## Where to edit

| File | Purpose |
| --- | --- |
| `src/App.jsx` | Screens, session flow, and separate participant drafts |
| `src/data.js` | Fictional scenarios, choices, and fallback presets |
| `src/CreativeChoice.jsx` | Creative categories and catalog status/retry UI |
| `src/CreativeCatalog.jsx` | Shared public catalog state and request cancellation |
| `src/creative-api.js` | Validated ColorMind and Apple chart requests |
| `src/itunes-jsonp.js` | Browser-compatible iTunes fallback |
| `src/SketchPad.jsx` | Drawing, local PNG state, preview, and clear |
| `src/components.jsx` | Illustration, icons, modal, and reveal display |
| `src/styles.css` | Fonts, colors, responsive layout, and focus states |

## Privacy and public catalog APIs

Participant choices, text, drawings, and nicknames stay in React state. Submission reveals responses locally; there is no response-upload endpoint, authentication, analytics, or persistent storage. The wording check is a small keyword placeholder, not moderation. The app is not counseling or conflict resolution.

ColorMind receives only the fixed request `{"model":"default"}`. Songs first try Apple's public US top-songs feed. If that browser request fails, Apple's credential-free iTunes Search API is used through its supported JSONP callback with a fixed `feel good` query. Those results are labeled as suggestions, not current chart rankings. If both services fail, real-song presets stay selectable. Audio and artwork are not fetched.

No participant inputs appear in catalog requests. Third-party services still receive ordinary connection metadata. Catalog availability and CORS support are separate from whether a URL opens in a browser tab.

Optional approved HTTPS catalog proxy URLs are described in `.env.example`. Never put credentials in a `VITE_` variable; those values are visible in browser code. `.env` files and dependencies/build outputs are excluded from Git.

## Browser checks

These optional checks require Python Playwright and Chromium, plus the app running in another terminal:

```sh
python3 scripts/smoke_test.py
python3 scripts/creative_smoke_test.py
```

They use controlled success/failure fixtures for catalog responses. Set `CHROMIUM_PATH` to a locally installed browser if needed; otherwise the scripts use system Chromium when available or Playwright's installed Chromium. `APP_URL` can point to another local test server.

Cloud validation covered production builds, all 12 unit tests, desktop/mobile flows, private handoffs, sketching, retries, and API failure handling. Live Apple/ColorMind access was blocked by that environment's network policy. Fixture success does not establish live API access on your computer; the UI shows whether live choices or presets are being used.
