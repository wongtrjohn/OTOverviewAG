# OT Overview · Recap Edition — v29

Builds on v28 (multi-file static site, Supabase not required). v27/v28 untouched.

## Recap modes — Meditate is now the default
A **Meditate & Reflect ⇄ Study & Reflect** toggle sits in the recap top bar. **Meditate & Reflect is the default** for anyone who hasn't chosen before (a returning user's saved choice is respected).

- **Meditate & Reflect** — for readers who've already worked through a session once. Same sections, lighter touch: comprehension Q&A becomes one gentle reflective prompt per division, a "Be still" stillness pause with a reflection timer opens the sections, Pause & Pray gains a set-aside prayer time, and flashcards are hidden.
- **Study & Reflect** — the full in-depth version: comprehension Q&A, guess-first reveals, and thread-picking.

The picker copy in Meditate mode now opens with a bold emphasised **"Finished studying a session already?"** followed by: "This mode focuses on dwelling on the truths learnt during the session and spending time with God intentionally. Fewer and more intentional questions. Your notes here are kept separate from Study mode."

Inputs stay separated per mode (`OT_RECAP_v1_<id>` vs `OT_RECAP_MED_v1_<id>`); the choice persists (`OT_RECAP_MODE`) and is shareable via `#view=recap&s=5&m=meditate`.

## Intro page
Threads line reads: "Sessions 02–11 trace these threads from Genesis to Deuteronomy. Remember to ask of every passage — what does this tell me about Jesus?"

## Session picker
Session 1 is a dedicated "Introduction" row that redirects to the Introduction page (and `s=1` deep links redirect too). Sessions 02–11 under "Read & Reflect"; Session 12 under "Review & Reflect".

## Session 12 — "Review & Reflect"
A distinct, big-picture-style flow: a brief hero summary, then the whole Pentateuch laid out as the three arcs (Promises, Salvation, Kingdom) with each session's one-line main point — the same shape as the Big Picture view. It now also includes **placeholder prompt sections** ready to populate:

- **"Questions to sit with"** — a few reflective question blocks with answer boxes.
- **"Prompts to pray through"** — a short list of prayer prompts, plus the ACTS prayer and a set-aside prayer timer.

These ship with gentle generic placeholders and are overridable from the Data Entry tab (see below), so you have "space to prompt" that you can fill in later without touching code.

## Flashcards — removed (archived)
Flashcards were removed from the app on 2026-06-23. The full feature (deck builder + flip-card runner) is archived in `archive/flashcards.js` with restore notes; its CSS remains dormant in `index.html`, so it can be brought back without rebuilding it.

## New optional Data Entry columns (single-source-of-edits preserved)
All have built-in fallbacks if left blank:

- **`meditatePrompt`** (per passage-division) — the reflective prompt shown in Meditate mode for that division.
- **`reflectionFocus`** (per session) — a session-level reflective focus used when a division has no `meditatePrompt`.
- **`reviewQuestions`** (Session 12) — newline-separated reflective questions for the "Questions to sit with" section.
- **`prayerPrompts`** (Session 12) — newline-separated prayer prompts for "Prompts to pray through".

## Deploy & test
Static — drag the folder into Vercel or any static host. Test via a server (not file://): `cd v29 && python -m http.server`. Members' answers are per-browser; export a backup before switching devices.

## Verification
All JSX compiles and passes `node --check`; a render harness executed every new and edited component (RecapMode both modes, CR_SessionRecap Study + Meditate across sessions, the timer, prayer time, meditative division, and the S12 Review & Reflect flow with placeholders) with no errors, and confirmed the default mode is now Meditate, storage/progress are mode-separated, and the removed flashcard-tracking globals are gone. A live browser click-through is recommended before launch (the Chrome extension can't open local file:// URLs from here).
