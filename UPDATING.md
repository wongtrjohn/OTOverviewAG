# Updating the OT Overview site content

Your website's content (every session's questions, threads, prayers, division Q&A) now comes from **one Excel workbook** — `RECAP MODE - Data Entry USE THIS v9 (synced).xlsx`. You edit the workbook, run one file, and push. That's it.

This was set up so all future edits live in the **Data Entry workbook only** — you never touch the code.

---

## One-time setup (≈10 minutes, do this once)

1. **Add these files to your repository.** Open your GitHub repo folder on your computer (in GitHub Desktop: *Repository → Show in Explorer*). Copy everything from this package into it, keeping the folder structure:
   - `index.html`  (replaces the old one — adds one line that loads the workbook content)
   - `assets/js/content-overrides.js`  (the generated content; goes inside `assets/js/`)
   - `build_site_data.py`  (the converter)
   - `update-site.bat`  (Windows one-click runner) / `update-site.command` (Mac)
   - `.gitignore`
   - `UPDATING.md`  (this file)
   - `RECAP MODE - Data Entry USE THIS v9 (synced).xlsx`  (your new master workbook)

2. **Install Python once** (the converter needs it): https://www.python.org/downloads/ — during install, tick **“Add Python to PATH.”** (Mac usually already has it.)

3. **Commit & push** in GitHub Desktop so the repo now contains the workbook + converter. Your live site is unchanged by this step — the content is identical to what's already published (verified).

---

## The everyday update loop (≈1 minute)

1. **Open the workbook** `RECAP MODE - Data Entry USE THIS v9 (synced).xlsx` and edit any content on the **Sessions** or **Division Questions** tab. Save and close it.
2. **Double-click `update-site.bat`** (Windows) or `update-site.command` (Mac). It reads the workbook and rebuilds `assets/js/content-overrides.js`. Wait for “Done.”
3. **Open GitHub Desktop**, type a short note (e.g. “Update Session 5 questions”), click **Commit to main**, then **Push origin**.
4. Your live site updates in about **30 seconds**. Refresh the page to see it.

> Tip: always run step 2 after editing the workbook. If you commit without running it, the workbook changes but the site won't — because the site reads the generated file, not the spreadsheet directly.

---

## What you can edit in the workbook

**Sessions tab** — one row per session: starting question, before-you-begin, passage divisions, main point, key verse, the three threads, God's character/intent + man's reality, NT passage/point, the three Apply questions, further-study links, highlight thread, prayer (Adore/Confess/Thank/Supplicate), "pray for", and the optional flashcard hints.

**Division Questions tab** — one row per passage division: the range, title, up to 3 questions (each with prompt + hint + suggested answer), and a Mini Summary. Leave a question's Prompt blank and it simply won't appear.

The README tab inside the workbook documents every column.

### New Meditate-mode columns (optional)
If you want to control the Meditate-mode prompts, add these columns (the converter picks them up automatically by name; blank = sensible default is used):
- Sessions tab: a **Reflection Focus** column → `reflectionFocus`; for Session 12, **Review Questions** → `reviewQuestions`, and **Prayer Prompts** → `prayerPrompts` (put each item on its own line with Alt+Enter).
- Division Questions tab: a **Meditate Prompt** column → `meditatePrompt`.

---

## Good to know

- **Don't hand-edit `content-overrides.js` or `data.js`** — your changes would be wiped next time you run the converter. The workbook is the source of truth.
- **What the converter touches:** only `assets/js/content-overrides.js`. Everything else (design, layout, images, the big-picture/covenant/map data) is untouched.
- **Two images** (the Tabernacle photo and the Sinai-vs-Tabernacle diagram) are attached in the converter, not the workbook, so they're preserved automatically.
- **Members' typed answers** live only in their own browser and are never affected by content updates.
- **If something looks wrong after an update:** in Vercel → *Deployments*, click an earlier good build → **Promote to Production** to roll back instantly, then fix the workbook and re-push.

---

## Why a workbook instead of editing Supabase

Your app is a fast static site and doesn't read from a database, so content edits go through the workbook → converter → push flow above. If you ever want non-technical helpers to edit content live in a web table (no pushing), that's the moment to move this content into Supabase — tell me and I'll wire it up. For now, the workbook keeps things simple, free, and version-controlled.
