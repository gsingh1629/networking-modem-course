# 📡 Signal Log

> **A running trace of every question asked and every explanation given while building this
> course.** Like a packet capture, but for our conversation — nothing gets lost, and you can
> replay any exchange later.

**How this works**
- Every time you ask something, I add an entry here (newest at the **bottom**, so it reads
  in order like a story).
- Each entry has the **date**, a **topic tag**, your **question** (as you asked it), and my
  **explanation** (a durable summary — not just "see above").
- Entries are numbered `Q01`, `Q02`, … so we can reference them (e.g. "as covered in Q07").
- Learning questions get tagged with the relevant **module**, so this doubles as a personal
  FAQ you can search on the live site.

**Jump to:** [Index](#index) · below that, the full log in order.

---

## Index

| # | Date | Topic | Question (short) |
|---|------|-------|------------------|
| [Q01](#q01--make-it-an-interactive-github-repo) | 2026-07-24 | Setup | Turn the course into an interactive GitHub repo others can learn from? |
| [Q02](#q02--publish-it-under-my-github) | 2026-07-25 | Setup | Set it up on my GitHub profile (gsingh1629). |
| [Q03](#q03--keep-a-record-of-all-my-questions) | 2026-07-25 | Meta | Record every question + explanation in a uniquely-named file in the repo root. |

---

## Full log

### Q01 — Make it an interactive GitHub repo
**Asked:** 2026-07-24 · **Topic:** Setup / tooling

**Question**
> Can we somehow make this interactive github repo? so that even others can learn?

**Explanation**
Yes. I converted the plain markdown course into a **zero-build [Docsify](https://docsify.js.org)
site** — Docsify renders markdown into a navigable site *in the browser*, so there's no build
step and GitHub Pages can serve the files directly. What "interactive" means here:

- **Sidebar navigation + full-text search** across the whole course (`_sidebar.md`, search plugin).
- **Clickable quizzes** — a tiny custom engine (`assets/quiz.js` + `quiz.css`): you pick an
  option and get instant ✓/✗ feedback plus an explanation. Authored as simple HTML so
  contributors can add them easily.
- **Mermaid diagrams** — fenced ```mermaid blocks render as real diagrams both on the site
  *and* in GitHub's file view.
- **Copy-code buttons, pagination, image zoom**, a cover page, and dark-mode-friendly styling.

I also added the "so others can learn" scaffolding: `CONTRIBUTING.md` (documents the quiz +
diagram authoring format), a dual `LICENSE` (CC BY 4.0 for the writing, MIT for the site code),
and `.nojekyll` (so GitHub Pages doesn't strip Docsify's underscore-prefixed files). Then I
`git init`-ed the folder and made the first commit.

**Key takeaway:** the course is now *static files anyone can host or fork* — the interactivity
is all client-side JS, no server required.

---

### Q02 — Publish it under my GitHub
**Asked:** 2026-07-25 · **Topic:** Setup / publishing

**Question**
> https://github.com/gsingh1629 this is the github profile set it up

**Explanation**
Published it end to end. The one thing I couldn't do was prove your identity to GitHub, so:
your only SSH key was a **GitLab** key (GitHub rejected it) and there were no tokens, so I
installed the **GitHub CLI** (`gh`) via Homebrew and had you do a one-time `gh auth login`
(browser device-code flow — no secret ever passed through me). After you authenticated as
`gsingh1629`, I:

1. Created the public repo **`gsingh1629/networking-modem-course`** and pushed `main`.
2. Enabled **GitHub Pages** (deploy from `main` / root) — build confirmed, site returns HTTP 200.
3. Added repo **topics** (networking, cellular, lte, education…) and set the homepage.
4. Wired the **"Edit on GitHub" ribbon** by setting `repo:` in `index.html`, then pushed.

**Results:**
- 💻 Repo: <https://github.com/gsingh1629/networking-modem-course>
- 📖 Live site: <https://gsingh1629.github.io/networking-modem-course/>

`gh` is now installed and authenticated on your machine (keyring), so future GitHub actions
(new repos, PRs, issues) don't need another login.

**Key takeaway:** GitHub Pages serves the repo's files directly — every `git push` to `main`
now auto-redeploys the live site within ~1 minute.

---

### Q03 — Keep a record of all my questions
**Asked:** 2026-07-25 · **Topic:** Meta / process

**Question**
> Even i want you to jot down my questions and your explanations in a FAQ's or name it
> something unique to record everything. But make sure that this lives in the root directory
> of this repo.

**Explanation**
This file (`SIGNAL-LOG.md`) is that record — it lives in the repo root and is linked in the
site sidebar so it's searchable alongside the modules. From now on, each time you ask
something — whether it's about the tooling or a deep networking concept — I'll append a dated,
tagged entry here with your question and a durable explanation, so nothing we discuss gets
lost and you can revisit or search it anytime.

**Key takeaway:** ask freely — every question becomes a permanent, searchable part of the
course.

---

<!--
TEMPLATE for the next entry (copy below the last one):

### Q0N — <short title>
**Asked:** YYYY-MM-DD · **Topic:** <Module NN / topic>

**Question**
> <the question, verbatim>

**Explanation**
<durable summary of the answer>

**Key takeaway:** <one-line memorable point>

---
-->
