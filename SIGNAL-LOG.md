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
| [Q04](#q04--how-does-the-physical-signal-travel--how-do-bits-form) | 2026-07-25 | Module 02 | How does data become 0s/1s, and how does the signal travel across? |
| [Q05](#q05--headers-add-size--why-add-them) | 2026-07-25 | Module 01/11 | Adding headers grows the packet — why add them at all? |
| [Q06](#q06--what-happens-when-we-hit-googlecom) | 2026-07-26 | Cross-cutting | What happens end-to-end when we hit google.com? |

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

### Q04 — How does the physical signal travel & how do bits form?
**Asked:** 2026-07-25 · **Topic:** Module 02 (Physical layer)

**Question**
> How does this physical signal travels? Like let's say we reach on the physical layer, but
> how does this data gets converted into 0's and 1's? and let's say it gets converted but how
> does this data travel across?

**Explanation**
This question *is* Module 02, written in full: **[02 · How data physically moves](02-how-data-moves.md)**.
The short version:

- **The data is already bits before L1 ever sees it.** Text (via ASCII/UTF-8, e.g. `A`=65=
  `01000001`), numbers (base-2), images (RGB values), and sound (sampled by an ADC) are all
  binary in memory. So the physical layer's job isn't *data → bits* — it's **bits → signal →
  bits**.
- **Turning bits into a signal** happens two ways: **line coding** (put voltage levels
  directly on copper — but you must keep the clock synced, e.g. Manchester encoding) and
  **modulation** (vary a carrier wave's amplitude/frequency/phase — **this is literally what
  a modem does**: modulator-demodulator). Combining amplitude+phase gives **QAM**, packing
  many bits per **symbol** (256-QAM = 8 bits/symbol). You can't pack infinitely many because
  **noise** limits it (Shannon: capacity = bandwidth × log₂(1+SNR)) — which is why weak
  signal → slower speeds (adaptive modulation).
- **The signal travels** as an electromagnetic wave through the medium: **copper** (voltage,
  ~0.6c, hurt by attenuation/crosstalk), **fiber** (light pulses via total internal
  reflection, low loss + huge bandwidth), or **radio** (modulated carrier from an antenna,
  ≈c, hurt by path loss/interference/multipath — the reason cellular is hard).
- **What travelling costs = the delay budget:** transmission (bits/bandwidth) + propagation
  (distance/speed — the latency floor bandwidth can't fix) + processing + queuing.

**Key takeaway:** L1 doesn't convert data to bits (that already happened) — it converts
**bits ↔ physical signal**, and the "travel time" is a budget of four separate delays, of
which only *transmission* depends on bandwidth.

---

### Q05 — Headers add size — why add them?
**Asked:** 2026-07-25 · **Topic:** Module 01 (encapsulation) → Module 11 (PDCP/ROHC)

**Question**
> As we go down the layers, we add headers and more headers. But this increases the size of
> the whole packet right? Why is this added?

**Explanation**
Yes — headers are pure **overhead**, and yes, they grow the packet. They're added because
**each layer needs its own control information to do its job**, and in a layered design that
info must travel *in-band* (attached to the data) so the matching layer on the other side can
read it. Concretely, each header answers a question only that layer cares about:

- **Ethernet header (~14B) + CRC trailer (4B):** which device on this link (dest/src MAC),
  what's inside (EtherType), and did it arrive intact (checksum)?
- **IP header (~20B):** which *machine* globally (src/dst IP), how many hops left (TTL),
  what's the next protocol?
- **TCP header (~20B):** which *program* (ports), byte ordering & reliability (sequence/ack
  numbers), flow control (window), integrity (checksum)?

Strip any of these and that layer literally cannot function — no MAC = can't reach the next
hop; no ports = can't tell which app; no seq numbers = no reliability/ordering. The overhead
is **the price of modularity**: independent, swappable, interoperable layers.

**The nuance you're intuiting is real, though:** overhead *ratio* depends on payload size.
The ~54 bytes of TCP/IP/Ethernet headers are:
- **~3.6%** of a full 1500-byte packet → negligible (amortized over lots of data).
- **~98%** of a 1-byte payload → terrible. This is why big transfers use large packets and
  batching.

And when overhead genuinely hurts — e.g. **VoIP**, where ~32 bytes of audio ride under ~40
bytes of IP/UDP/RTP headers (>50% waste) — networks fight back with **header compression**.
Cellular's **PDCP** layer uses **ROHC (Robust Header Compression)** to squash those 40 bytes
down to ~1–3 bytes over the air, because radio spectrum is precious. (We'll cover this in
Module 11 — it's a direct payoff of understanding *why* headers exist.)

**Key takeaway:** headers are the unavoidable cost of the layered model — each layer's
"shipping label." The cost is negligible for big payloads, painful for tiny ones, which is
exactly why header *compression* (PDCP/ROHC on cellular, HPACK/QPACK in HTTP/2/3) exists.

---

### Q06 — What happens when we hit google.com?
**Asked:** 2026-07-26 · **Topic:** Cross-cutting (ties every layer together)

**Question**
> One most basic question I think, What happens when we hit google.com? Explain it in depth.

**Explanation**
This is the canonical end-to-end walkthrough — it touches every layer, so I wrote it as a
flagship deep-dive page: **[🌐 Deep dive: hitting google.com](deep-dive-loading-google.md)**.
The phases, in order:

1. **Browser processing** — normalize input, HSTS forces `https://`, check for a reusable
   connection.
2. **DNS** — name → IP, checking browser/OS/hosts caches, then a recursive resolver that
   walks root → `.com` TLD → Google's nameservers (over UDP/53; Anycast returns the nearest
   server; answers cached by TTL).
3. **ARP / local delivery** — to send packet one, resolve the gateway's MAC. IP stays
   Google's end-to-end; MAC is the next hop (changes every hop).
4. **TCP handshake** — SYN / SYN-ACK / ACK to port 443 (1 RTT).
5. **TLS handshake** — exchange keys + verify Google's certificate (chain of trust to a
   root CA, hostname, validity). TLS 1.3 ≈ 1 RTT; everything after is encrypted.
6. **HTTP request** — `GET /` with headers/cookies; HTTP/2 multiplexes, HTTP/3 (QUIC over
   UDP, Google-invented) collapses setup to 1-/0-RTT.
7. **Server side** — hits the nearest Google Front End (edge/CDN/load balancer), which
   serves or fetches the response.
8. **Rendering** — parse HTML→DOM, fetch subresources (each may repeat the whole race),
   CSSOM → render tree → layout → paint.

**Latency budget (cold):** DNS (~0–1 RTT) + TCP (1) + TLS (1) + request→first-byte (1) ≈
**3–4 RTT + server time** before content. Warm/HTTP-3 can be ~1 RTT or less. On mobile, add
RRC setup (~50–100 ms) if the radio was idle. The RTT floor is physics (propagation delay),
which is why Google puts servers physically near you.

**Key takeaway:** "loading a page" is a relay race across every layer, run many times — and
most of a cold load's delay is *setup round-trips*, which is exactly what HTTP/3/QUIC was
built to eliminate.

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
