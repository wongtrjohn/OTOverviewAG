# CLAUDE.md — OT Overview · Recap Edition

Guidance for Claude Code when working in this repository. Read this fully before making changes.

## What this project is

A **recap version** of an Old Testament Overview dashboard, built for a church Bible study. The audience is a regular Bible-study member who may have missed sessions and needs help visualising how the Old Testament reveals God over time. The guiding aim is **clarity and user-friendliness** above cleverness.

- Live site: https://ot-overview-ag.vercel.app/
- Repo: https://github.com/wongtrjohn/OTOverviewAG
- It is a **static multi-file site** (no build step for code, no server, no database). React is loaded via dev `<script>` tags; the app logic is plain `React.createElement` JavaScript in `assets/js/app/`.

## The golden rule: content lives in the workbook, not the code

All **content** (sessions, questions, threads, prayers, division Q&A, Meditate prompts) comes from one Excel workbook: `RECAP MODE - Data Entry USE THIS v9 (synced).xlsx`. The workbook is the single source of truth.

- **Never hand-edit** `assets/js/content-overrides.js` or `assets/js/data.js` — they are generated; manual edits get wiped on the next build.
- To change content: edit the workbook → run the converter (below) → commit & push.
- The converter (`build_site_data.py`) only rewrites `assets/js/content-overrides.js`. Everything else (design, layout, images, arcs/covenants/maps in `data.js`) is left alone.
- If asked to add content fields, prefer adding a **named column** in the workbook — the converter picks columns up by header name with sensible blank-defaults. See `UPDATING.md` for the column list.

## Content vs structural edits

- **Content edit** (questions, prayers, prompts, text shown to members) → workbook → converter → push. Do not touch JS.
- **Structural edit** (layout, CSS, behaviour, new UI, bug fixes) → edit the JS/HTML/CSS in `assets/` directly.

## Build & deploy

Everyday content update loop:

1. Edit the workbook (Sessions tab / Division Questions tab), save, close.
2. Rebuild content: run `update-site.bat` (Windows) or `update-site.command` (Mac), or directly `python build_site_data.py`. Requires `pip install openpyxl`.
3. Commit and push to `main`. Vercel auto-deploys in ~30s.

Claude Code may run the converter and the git commands directly. Always run the converter **after** editing the workbook and **before** committing, or the site won't reflect the spreadsheet.

**Rollback:** Vercel → Deployments → pick an earlier good build → Promote to Production. Then fix the workbook/code and re-push.

## Key files

- `index.html` — entry point; loads the app JS in order, then `content-overrides.js` last.
- `assets/js/app/00-helpers.js` — shared helpers, parsers, and the `useLocalStorage` hook.
- `assets/js/app/01-nav.js` … `05-app.js` — navigation, subway map, views, recap mode, app shell.
- `assets/js/app/04-recap.js` — Recap Mode (Study & Meditate): all member-facing answer inputs.
- `assets/js/data.js` — curated structural/visual data (arcs, covenants, maps). Generated-ish; do not hand-edit content into it.
- `assets/js/content-overrides.js` — **generated** from the workbook. Do not edit by hand.
- `build_site_data.py` / `update-site.bat` / `update-site.command` — the converter and runners.
- `UPDATING.md` — the non-technical content-editing guide (authoritative for the workbook columns).

## Recap Mode state model — do not regress

Member answers are saved in `localStorage`, namespaced per session **and** per mode so nothing collides:

- Study mode: `OT_RECAP_v1_<sessionId>`
- Meditate mode: `OT_RECAP_MED_v1_<sessionId>`
- Flashcards: `OT_FLASH_v1_<sessionId>`
- Mode choice: `OT_RECAP_MODE`; last-opened: `OT_LAST_v1`.

**Important invariant (a bug that was fixed — keep it fixed):** each session/mode must keep its inputs in its own box. Two things enforce this:

1. `useLocalStorage` in `00-helpers.js` is **key-aware** — it re-reads storage whenever the key (session/mode) changes. Do not revert it to a one-time `useState` initialiser, or typed notes will "follow" the user across sessions/tabs and overwrite each other.
2. `CR_SessionRecap` and `CR_ReviewReflect` are rendered with `key={mode + ':' + session.id}` so each session/mode gets a fresh component instance.

If you add new per-session inputs, route them through `useLocalStorage` with a session+mode-scoped key.

## Future: Supabase

The app is intentionally database-free today; content flows through the workbook. `useLocalStorage` is the single place that loads/saves answers — if/when moving to Supabase, swap its get/set for a row keyed by `user_id + session_id + mode`. The key-change re-read already guarantees the right row loads on switch. Don't introduce Supabase unless explicitly asked.

## Conventions

- Keep the code framework-free (no bundler/JSX build); match the existing `React.createElement` style.
- Preserve member privacy: typed answers live only in the member's browser and must never be sent anywhere or wiped by content updates.
- Prioritise readability and accessibility — this is for non-technical Bible-study members.
- Verify JS changes parse (`node --check <file>`) before committing.

## Environment / location

This repo lives at `C:\ClaudeLocal\OTOverviewAG` — a plain local path, deliberately **outside** OneDrive (OneDrive syncing the `.git` folder can corrupt the repo). Do not move it back under OneDrive. The repo is self-contained: the remote is GitHub HTTPS, git config holds no absolute paths, and the build scripts use relative paths, so it can be relocated freely if ever needed. The Data Entry workbook is no longer OneDrive-backed; its backup is the committed copy on GitHub after each push.
