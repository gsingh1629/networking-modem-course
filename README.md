# Networking & Modem: Zero to Hero

A ground-up course on how data moves across networks — from electrons on a wire to
4G/5G paging and RRC state machines — built for a software engineer who wants deep,
practical, *usable* understanding.

> 🌐 **This is an interactive site.** Sidebar navigation, full-text search, clickable
> quizzes, and rendered diagrams. Run it locally with `docsify serve .` (or
> `python3 -m http.server`), or publish it free via GitHub Pages — see
> [Running & publishing](#running--publishing) below. Contributions welcome — see
> [CONTRIBUTING.md](CONTRIBUTING.md).

**Learner profile:** strong software engineer, weak on networking. So: no networking
jargon goes unexplained the first time it appears, but systems/programming concepts are
assumed.

**Depth bias:** everything. Core networking, cellular/4G internals, latency mechanics,
and hands-on hardware/software projects all get first-class treatment.

---

## How to use this course

- Each **module** is one markdown file. Read it top to bottom.
- **`>` callouts** are mental models — the intuition to keep even if you forget details.
- **`⚡ Latency note`** blocks connect the concept back to real-world latency (your
  original motivation from the embedded project).
- Every module ends with **Exercises** (do them — networking sticks through doing) and a
  **Cheat-sheet** you can skim later.
- A running **[GLOSSARY.md](GLOSSARY.md)** collects every term. When you hit a word you
  don't know, it's there.
- The **[📡 Signal Log](SIGNAL-LOG.md)** is a dated, searchable trace of every question
  asked while building this course and the explanation given — a growing personal FAQ.
- We build **projects** as we go — labeled `🔧 Project` — using real tools (Wireshark,
  `tcpdump`, SDR, etc.).

---

## The roadmap (the whole journey)

We go **bottom-up then deep**: first the map (layers), then down to the physics, then
back up through each real protocol, then into the cellular/modem stack, then the
advanced and "hidden" topics.

### Part I — Foundations & the mental map
- **[01 — The Layered Model](01-the-layered-model.md)** ← *start here*
  Why layers exist, OSI vs TCP/IP, what each layer's *job* is, encapsulation.
- **02 — How data physically moves** *(coming next)*
  Bits, signals, bandwidth vs latency vs throughput, modulation — what a "modem" is.

### Part II — Core networking, layer by layer
- **03 — Link layer**: Ethernet, frames, MAC addresses, switches, ARP, collisions.
- **04 — Network layer**: IP addressing, subnets, routing, NAT, ICMP, IPv6.
- **05 — Transport layer**: ports, UDP, TCP (handshake, flow & congestion control), QUIC.
- **06 — Application protocols**: DNS, HTTP/1.1→2→3, TLS, how a page load actually works.

### Part III — Wireless & the modem
- **07 — RF & wireless basics**: spectrum, frequency, dB, antennas, why wireless is hard.
- **08 — Wi-Fi**: 802.11, CSMA/CA, association, why Wi-Fi latency is spiky.
- **09 — Cellular architecture**: 2G→5G history, the LTE network (UE, eNodeB, EPC/core).

### Part IV — 4G/LTE modem internals (the heart of your interest)
- **10 — The LTE air interface**: OFDMA, resource blocks, frames, the PHY layer.
- **11 — The LTE protocol stack**: MAC, RLC, PDCP, RRC — what each does & why.
- **12 — Procedures**: attach, RRC states (IDLE/CONNECTED), paging, page misses,
  handover, DRX. This is where "modem" concepts live.

### Part V — Latency, constrained devices, and the hidden stuff
- **13 — Latency, end to end**: a single number decomposed across every layer.
- **14 — Constrained & IoT devices**: NB-IoT, LTE-M, PSM/eDRX, power vs latency tradeoffs.
- **15 — VPNs & tunneling**: what a tunnel really is, WireGuard/IPsec, split tunneling.
- **16 — The RF underworld**: SDR, sniffing, IMSI catchers & jammers (theory + law + ethics).

### Part VI — Capstone projects
- Build-along projects combining hardware + software (packet analyzer, SDR spectrum
  viewer, a tiny VPN, latency probe across layers).

---

## Running & publishing

**Run locally** (nothing to build — it's static):

```bash
# nicest: live-reload
npm i -g docsify-cli && docsify serve .
# or zero-install:
python3 -m http.server 3000   # then open http://localhost:3000
```

**Publish free on GitHub Pages:**

1. Create a repo on GitHub and push this folder (commands are in the chat / below).
2. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   pick `main` and folder `/ (root)`, Save.
3. Wait ~1 minute → your course is live at
   `https://<username>.github.io/<repo-name>/`.
4. (Optional) edit `index.html` and set `repo: '<username>/<repo-name>'` to get the
   "Edit on GitHub" corner ribbon.

The `.nojekyll` file is already included so GitHub Pages serves the Docsify files
correctly.

## Progress tracker

- [x] 01 — The Layered Model
- [x] 02 — How data physically moves
- [x] 03 — Link layer
- [x] 04 — Network layer
- [x] 05 — Transport layer
- [x] 06 — Application protocols
- [x] 07 — RF & wireless basics
- [x] 08 — Wi-Fi
- [x] 09 — Cellular architecture
- [x] 10 — LTE air interface
- [x] 11 — LTE protocol stack
- [x] 12 — Procedures (paging, RRC, handover)
- [x] 13 — Latency end to end
- [x] 14 — Constrained & IoT devices
- [x] 15 — VPNs & tunneling
- [x] 16 — The RF underworld
- [ ] Capstone projects

*Check these off as we go. We're starting with Module 01.*
