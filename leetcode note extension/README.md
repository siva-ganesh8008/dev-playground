# 📄 LeetCode Solutions → Word Exporter

A Chrome extension that exports all your **solved LeetCode problems** — statement,
examples, images, and your accepted submitted code — into a single, clean Word
(`.docx`) document.

---

## ✨ Features

- 📝 Full problem statement, examples, and images embedded directly in the doc
- 💻 Your actual accepted submission code per problem
- 🎚️ Filter by difficulty — Easy / Medium / Hard
- ⚡ Parallel requests — export multiple problems at once instead of one-by-one
- ⏱️ Live timer — see elapsed time while exporting, and total time when done
- 📊 Progress bar with a running log of what's happening

---

## 🧩 Setup (one-time)

### Step 1 — Get the `docx` library file

This extension uses the [`docx`](https://www.npmjs.com/package/docx) JavaScript
library to build a real Word file in the browser. It isn't bundled in this folder,
so grab it once:

1. 🔗 Open: **https://unpkg.com/docx/dist/index.umd.cjs**
2. 💾 Save the page as `docx.min.js` (Ctrl+S / Cmd+S → "Webpage, Text Only" or similar)
3. 📁 Place that file in this same folder, next to `manifest.json`

> ⚠️ If that link ever 404s (the library's build path has shifted before), open
> `https://unpkg.com/browse/docx/`, look inside the `dist` or `build` folder shown
> there, and grab whichever file is named `index.umd.js` or `index.umd.cjs`.

### Step 2 — Load the extension into Chrome

1. 🌐 Open `chrome://extensions` in Chrome
2. 🛠️ Toggle **Developer mode** on (top-right corner)
3. 📂 Click **Load unpacked**
4. ✅ Select this folder

You should now see the extension's icon in your Chrome toolbar.

---

## 🚀 How to use

1. 🔑 **Log into leetcode.com** in this same Chrome profile (any tab — it just
   needs to be logged in, the tab itself can be closed afterward)
2. 🖱️ Click the extension icon in your toolbar → click **Open Exporter**
   (this opens a new tab where the export runs)
3. 🎚️ In that tab, choose your options:
   - ✔️ **Accepted (solved) problems only** — leave checked to skip unsolved/attempted problems
   - 🟢🟡🔴 **Difficulty** — check/uncheck Easy / Medium / Hard to include or exclude
   - ⚡ **Parallel requests** — how many problems to process at once:
     - `1` → slowest, safest
     - `3` → good default
     - `5` or `8` → fastest, but more likely to hit LeetCode's rate limiting
4. ▶️ Click **Start Export**
5. ⏱️ Watch the **timer** count up and the **progress bar** fill in as it works —
   the log below shows each problem as it's processed
6. 📥 When it finishes, `LeetCode_Solutions.docx` downloads automatically, and the
   timer shows **"Done in: m:ss"**

That's it — open the downloaded file in Word (or Google Docs) to see your full
solved-problem archive.

---

## 🛠️ Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| ❌ "Could not load problem list" | Not logged into leetcode.com in this Chrome profile | Log in, then retry |
| ❌ Some problems show fetch errors in the log | LeetCode rate-limiting you | Lower **Parallel requests** to `1`–`3` and re-run |
| 🖼️ Images show as plain text/links instead of pictures | Image failed to download — check the log for the specific error | Usually transient; re-run, or check your connection |
| 🐢 Export is slow overall | Large solved-list + low concurrency | Try raising **Parallel requests**, balancing against rate-limit risk |

---

## ⚙️ How it works, briefly

- Solved list → `https://leetcode.com/api/problems/all/`
- Problem statement + images + submission history → LeetCode's GraphQL endpoint
  (`/graphql/`)
- Everything gets assembled into one `.docx` using the `docx` JS library, then
  downloaded straight from the browser — no server, no external service involved
