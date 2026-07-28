# Module 10 — The LTE Air Interface

> **The one idea to keep:** LTE turns the radio into a **shared, scheduled grid of time
> and frequency**. Instead of one big carrier, it spreads data across *thousands of tiny
> orthogonal subcarriers* (OFDM) so it can survive echoes, then a scheduler in the tower
> hands out little rectangles of that grid — **resource blocks** — to specific users
> every **1 millisecond**. Where Wi-Fi and Ethernet let devices *fight* for the medium,
> LTE **assigns** it. That single design choice — central scheduling over a frequency-time
> grid — is what makes cellular fast, fair, and predictable in a brutally hostile channel.

Module 02 got a bitstream across *one* link by modulating a carrier, and warned that radio
is the hardest medium there is: path loss, interference, multipath, mobility. Module 07
covered how radio waves behave; Module 09 laid out the LTE network (UE ↔ **eNodeB** ↔ core).
This module zooms all the way into the **Uu interface** — the radio link between your phone
and the tower — and answers: *how do bits actually cross that gap?* This is the PHY (physical
layer) of LTE, built directly on Module 02's modulation and Shannon.

Prerequisites and neighbors: [Module 02](02-how-data-moves.md) (modulation, QAM, symbols,
Shannon), [Module 07](07-rf-wireless.md) (RF basics), [Module 09](09-cellular-architecture.md)
(the LTE architecture). Its sibling [Module 11](11-lte-protocol-stack.md) picks up *above*
the PHY — the MAC/RLC/PDCP layers that ride on top of everything here.

---

## 1. Why one carrier isn't enough: the multipath problem

Module 02 modulated a single carrier: vary its amplitude and phase (QAM) to pack several
bits into each **symbol**, send symbols back-to-back. On a clean wire that's fine. On radio
it falls apart, and the killer is **multipath**.

Your signal doesn't take one path to the tower — it bounces off buildings, cars, and walls,
arriving as many slightly-delayed copies. A symbol sent now overlaps with the echo of the
*previous* symbol still arriving. This smearing is **inter-symbol interference (ISI)**, and
it gets worse the *faster* you send symbols (the shorter each symbol, the more echoes from
neighbors pile in).

> **The trap of the obvious fix.** To go faster on one carrier you shorten each symbol — but
> shorter symbols are *more* vulnerable to multipath echo. So a single wide-band carrier hits
> a wall: speed up and ISI destroys you. LTE escapes the trap by going the *opposite* way —
> use a huge number of **very slow** carriers in parallel.

---

## 2. OFDM: many narrow orthogonal subcarriers

**OFDM (Orthogonal Frequency-Division Multiplexing)** is LTE's core trick. Instead of one
fast carrier across the whole channel, split the channel into **many narrow subcarriers**,
each spaced **15 kHz** apart, and send a slow, low-rate symbol stream on each one *in
parallel*. A 20 MHz LTE channel carries around **1200 subcarriers** at once.

Why this wins:

- **Each subcarrier is slow, so its symbols are long** → an echo arriving a microsecond late
  is a tiny fraction of a long symbol, so ISI is negligible. You get the *aggregate* speed of
  a wide channel without the ISI penalty of one fast carrier.
- **"Orthogonal" means they don't interfere despite overlapping.** The subcarriers are spaced
  so that at the exact frequency where one peaks, every other is at zero. The receiver can
  pull each subcarrier out cleanly even though their spectra overlap — no wasted guard bands
  between them. (This is done efficiently in silicon with an **FFT** — a Fast Fourier
  Transform — which is why OFDM only became practical once cheap DSP existed.)

### The cyclic prefix: a small tax that kills echoes

Long symbols help, but echoes still bleed a little into the start of the next symbol. OFDM
adds a **cyclic prefix (CP)**: copy the tail of each symbol and paste it in front as a short
guard interval (~4.7 µs in normal LTE). As long as every echo arrives *within* that guard
window, it lands in the disposable CP and never touches the real symbol. The receiver throws
the CP away and decodes a clean symbol.

> ⚡ **Latency note.** The cyclic prefix is pure overhead — ~7% of airtime spent on a guard
> interval that carries no data. It's the price of beating multipath. This is the recurring
> theme of the radio: you constantly *spend* capacity (CP, reference signals, error-correction
> coding, retransmissions) to buy *reliability* in a hostile channel. On fiber none of this
> exists.

---

## 3. OFDMA down, SC-FDMA up: why the two directions differ

OFDM describes how one link is built. LTE then uses it to serve *many* users:

- **Downlink (tower → phone): OFDMA** (Orthogonal Frequency-Division *Multiple Access*).
  The scheduler hands different **groups of subcarriers** (and time slots) to different users
  simultaneously. User A gets subcarriers 1–120, user B gets 121–240, all in the same
  millisecond. It's like assigning each user their own set of lanes on a very wide road.

- **Uplink (phone → tower): SC-FDMA** (Single-Carrier FDMA), a modified OFDM.

Why not just use OFDMA in both directions? **Battery.** Plain OFDM has a high
**PAPR (Peak-to-Average Power Ratio)**: summing thousands of subcarriers occasionally
produces huge instantaneous peaks. Handling those peaks demands a power amplifier that runs
inefficiently and drains the battery — fine for a tower plugged into the grid, painful for a
phone. **SC-FDMA** pre-processes the signal so its power is much smoother (lower PAPR), so the
phone's amplifier runs efficiently and cooler. Same grid, but the uplink trades a little
complexity for battery life.

| | Downlink | Uplink |
|---|---|---|
| Scheme | OFDMA | SC-FDMA |
| Who transmits | eNodeB | UE (phone) |
| Optimized for | throughput to many users | low PAPR → battery efficiency |
| Data channel | PDSCH | PUSCH |

---

<figure class="anim-fig">
<svg viewBox="0 0 720 300" role="img" aria-label="Animation: OFDMA splits one wideband LTE channel into many narrow orthogonal 15 kHz subcarriers, shared out to three users who each receive a different block of subcarriers.">
<style>
.m10a-t{font-size:13px;font-weight:700;fill:#2c7be5}
.m10a-sub{font-size:10px;fill:#64748b}
.m10a-leg{font-size:11px;font-weight:700}
.m10a-band{fill:#eef5ff;stroke:#2c7be5;stroke-width:2}
.m10a-sc{fill:none;stroke-width:2.6;animation:m10aglow 3.6s ease-in-out infinite}
.m10a-dot{animation:m10adot 3.6s ease-in-out infinite}
@keyframes m10aglow{0%,100%{stroke-opacity:.32}50%{stroke-opacity:1}}
@keyframes m10adot{0%,100%{r:2.4;fill-opacity:.4}50%{r:4;fill-opacity:1}}
</style>
<text x="12" y="20" class="m10a-t">OFDMA: split one wide channel into many narrow orthogonal subcarriers, shared among users</text>
<rect class="m10a-band" x="70" y="38" width="580" height="26" rx="5"/>
<text class="m10a-sub" x="360" y="55" text-anchor="middle">one wide channel (e.g. 20 MHz)  ≈  1200 subcarriers @ 15 kHz</text>
<polygon points="356,70 364,70 360,82" fill="#64748b"/>
<text class="m10a-sub" x="374" y="80">split into many slow, narrow subcarriers ↓</text>
<line x1="70" y1="230" x2="650" y2="230" stroke="#cbd5e1" stroke-width="1.5"/>
<path class="m10a-sc" d="M66 230 Q100 152 134 230" stroke="#2c7be5" style="animation-delay:0.00s"/>
<circle class="m10a-dot" cx="100" cy="152" r="3" fill="#2c7be5" style="animation-delay:0.00s"/>
<path class="m10a-sc" d="M100 230 Q134 152 168 230" stroke="#2c7be5" style="animation-delay:0.18s"/>
<circle class="m10a-dot" cx="134" cy="152" r="3" fill="#2c7be5" style="animation-delay:0.18s"/>
<path class="m10a-sc" d="M134 230 Q168 152 202 230" stroke="#2c7be5" style="animation-delay:0.36s"/>
<circle class="m10a-dot" cx="168" cy="152" r="3" fill="#2c7be5" style="animation-delay:0.36s"/>
<path class="m10a-sc" d="M168 230 Q202 152 236 230" stroke="#2c7be5" style="animation-delay:0.54s"/>
<circle class="m10a-dot" cx="202" cy="152" r="3" fill="#2c7be5" style="animation-delay:0.54s"/>
<path class="m10a-sc" d="M202 230 Q236 152 270 230" stroke="#2c7be5" style="animation-delay:0.72s"/>
<circle class="m10a-dot" cx="236" cy="152" r="3" fill="#2c7be5" style="animation-delay:0.72s"/>
<path class="m10a-sc" d="M236 230 Q270 152 304 230" stroke="#16a34a" style="animation-delay:0.90s"/>
<circle class="m10a-dot" cx="270" cy="152" r="3" fill="#16a34a" style="animation-delay:0.90s"/>
<path class="m10a-sc" d="M270 230 Q304 152 338 230" stroke="#16a34a" style="animation-delay:1.08s"/>
<circle class="m10a-dot" cx="304" cy="152" r="3" fill="#16a34a" style="animation-delay:1.08s"/>
<path class="m10a-sc" d="M304 230 Q338 152 372 230" stroke="#16a34a" style="animation-delay:1.26s"/>
<circle class="m10a-dot" cx="338" cy="152" r="3" fill="#16a34a" style="animation-delay:1.26s"/>
<path class="m10a-sc" d="M338 230 Q372 152 406 230" stroke="#16a34a" style="animation-delay:1.44s"/>
<circle class="m10a-dot" cx="372" cy="152" r="3" fill="#16a34a" style="animation-delay:1.44s"/>
<path class="m10a-sc" d="M372 230 Q406 152 440 230" stroke="#16a34a" style="animation-delay:1.62s"/>
<circle class="m10a-dot" cx="406" cy="152" r="3" fill="#16a34a" style="animation-delay:1.62s"/>
<path class="m10a-sc" d="M406 230 Q440 152 474 230" stroke="#f59e0b" style="animation-delay:1.80s"/>
<circle class="m10a-dot" cx="440" cy="152" r="3" fill="#f59e0b" style="animation-delay:1.80s"/>
<path class="m10a-sc" d="M440 230 Q474 152 508 230" stroke="#f59e0b" style="animation-delay:1.98s"/>
<circle class="m10a-dot" cx="474" cy="152" r="3" fill="#f59e0b" style="animation-delay:1.98s"/>
<path class="m10a-sc" d="M474 230 Q508 152 542 230" stroke="#f59e0b" style="animation-delay:2.16s"/>
<circle class="m10a-dot" cx="508" cy="152" r="3" fill="#f59e0b" style="animation-delay:2.16s"/>
<path class="m10a-sc" d="M508 230 Q542 152 576 230" stroke="#f59e0b" style="animation-delay:2.34s"/>
<circle class="m10a-dot" cx="542" cy="152" r="3" fill="#f59e0b" style="animation-delay:2.34s"/>
<path class="m10a-sc" d="M542 230 Q576 152 610 230" stroke="#f59e0b" style="animation-delay:2.52s"/>
<circle class="m10a-dot" cx="576" cy="152" r="3" fill="#f59e0b" style="animation-delay:2.52s"/>
<rect x="120" y="250" width="14" height="10" rx="2" fill="#2c7be5"/><text class="m10a-leg" x="140" y="259" fill="#2c7be5">User A</text>
<rect x="300" y="250" width="14" height="10" rx="2" fill="#16a34a"/><text class="m10a-leg" x="320" y="259" fill="#16a34a">User B</text>
<rect x="480" y="250" width="14" height="10" rx="2" fill="#f59e0b"/><text class="m10a-leg" x="500" y="259" fill="#f59e0b">User C</text>
<text class="m10a-sub" x="360" y="284" text-anchor="middle">Each subcarrier peaks exactly where every neighbour is zero (✓ orthogonal) — no wasted guard bands. The scheduler hands each user a different block.</text>
</svg>
<figcaption>This is <b>OFDMA</b>: the downlink is one wide channel diced into ~1200 narrow 15 kHz subcarriers. Because they are <i>orthogonal</i> (each peaks where the others cross zero) they overlap without interfering, and the eNodeB simply hands each user a different <b>block of subcarriers</b>.</figcaption>
</figure>

## 4. The resource grid: the map of time and frequency

This is the single most important picture in LTE. The air interface is a **2-D grid**: one
axis is **frequency** (subcarriers), the other is **time** (OFDM symbols). Everything the
tower and phone do is "fill in rectangles of this grid."

The building blocks, from smallest up:

- **Resource Element (RE)** — one subcarrier × one OFDM symbol. The *atom* of the grid. Each
  RE carries one modulation symbol (e.g. one 64-QAM symbol = 6 bits).
- **OFDM symbol** — one column of the grid in time (~71 µs including CP). A normal slot holds
  **7 OFDM symbols**.
- **Subcarrier** — one row, 15 kHz wide.
- **Resource Block (RB / PRB)** — the unit the scheduler actually allocates:
  **12 subcarriers (= 180 kHz) × one 0.5 ms slot**. So one RB = 12 × 7 = **84 REs**. When
  allocated in the frequency domain it's often called a **PRB (Physical Resource Block)**.
- **Slot** — 0.5 ms, 7 OFDM symbols.
- **Subframe** — 1 ms = 2 slots. **This is the TTI (Transmission Time Interval)** — the
  scheduling heartbeat. The tower makes a fresh allocation decision *every 1 ms*.
- **Frame** — 10 ms = 10 subframes.

```mermaid
flowchart TB
  subgraph FRAME["Radio frame = 10 ms"]
    direction LR
    SF0["subframe 0<br/>1 ms = 1 TTI"] --- SF1["subframe 1"] --- SFdots["…"] --- SF9["subframe 9"]
  end
  SF0 --> SLOT
  subgraph SLOT["One subframe (1 ms) = 2 slots of 0.5 ms"]
    direction LR
    S0["slot 0<br/>7 OFDM symbols"] --- S1["slot 1<br/>7 OFDM symbols"]
  end
  S0 --> RB
  subgraph RB["Resource Block = 12 subcarriers x 1 slot"]
    RE["Resource Element (RE)<br/>1 subcarrier (15 kHz) x 1 OFDM symbol<br/>carries ONE modulation symbol"]
  end
```

**Channel bandwidth sets how *wide* the grid is** — i.e. how many RBs exist per slot:

| Channel bandwidth | Resource blocks | Subcarriers (approx) |
|---|---|---|
| 1.4 MHz | 6 | 72 |
| 3 MHz | 15 | 180 |
| 5 MHz | 25 | 300 |
| 10 MHz | 50 | 600 |
| 15 MHz | 75 | 900 |
| 20 MHz | 100 | 1200 |

More bandwidth = more RBs = more rectangles the scheduler can hand out each millisecond =
more capacity. (This is Shannon from Module 02: capacity scales with bandwidth.) Carriers can
also be glued together — **carrier aggregation** — to exceed 20 MHz, e.g. 3 × 20 MHz = 60 MHz.

> **Mental model:** think of the resource grid as a spreadsheet that scrolls left-to-right in
> time forever. Every 1 ms the tower redraws which cells belong to which phone. Ethernet
> hands you the whole wire when it's your turn; LTE hands you a *sub-region of a shared grid*,
> and the region changes every millisecond.

---

<figure class="anim-fig">
<svg viewBox="0 0 720 340" role="img" aria-label="Animation: the LTE resource grid. Frequency (resource blocks) runs up the vertical axis and time (1 ms TTIs) along the horizontal axis; a sweeping cursor shows the eNodeB scheduler assigning different coloured blocks to different users every millisecond.">
<style>
.m10b-t{font-size:13px;font-weight:700;fill:#2c7be5}
.m10b-ax{font-size:11px;font-weight:700;fill:#64748b}
.m10b-leg{font-size:11px;font-weight:700}
.m10b-col{animation:m10bcol 8s linear infinite}
.m10b-sweep{animation:m10bsweep 8s steps(8,jump-none) infinite}
@keyframes m10bcol{0%,9%{opacity:1}20%,100%{opacity:.22}}
@keyframes m10bsweep{from{transform:translateX(0)}to{transform:translateX(462px)}}
</style>
<text x="12" y="20" class="m10b-t">The resource grid: the eNodeB scheduler re-assigns blocks to users every 1 ms TTI</text>
<text class="m10b-ax" x="26" y="190" transform="rotate(-90 26 190)" text-anchor="middle">frequency (resource blocks) ↑</text>
<g class="m10b-col" style="animation-delay:-8s">
<rect x="150" y="70" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="182" y="92" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="150" y="108" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="182" y="130" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="150" y="146" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="182" y="168" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="150" y="184" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="182" y="206" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="150" y="222" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="182" y="244" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="150" y="260" width="64" height="36" rx="3" fill="#cbd5e1"/>
</g>
<g class="m10b-col" style="animation-delay:-7s">
<rect x="216" y="70" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="248" y="92" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="216" y="108" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="248" y="130" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="216" y="146" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="248" y="168" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="216" y="184" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="248" y="206" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="216" y="222" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="248" y="244" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="216" y="260" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="248" y="282" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
</g>
<g class="m10b-col" style="animation-delay:-6s">
<rect x="282" y="70" width="64" height="36" rx="3" fill="#cbd5e1"/>
<rect x="282" y="108" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="314" y="130" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="282" y="146" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="314" y="168" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="282" y="184" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="314" y="206" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="282" y="222" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="314" y="244" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
<rect x="282" y="260" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="314" y="282" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
</g>
<g class="m10b-col" style="animation-delay:-5s">
<rect x="348" y="70" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="380" y="92" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="348" y="108" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="380" y="130" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="348" y="146" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="380" y="168" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="348" y="184" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="380" y="206" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="348" y="222" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="380" y="244" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="348" y="260" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="380" y="282" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
</g>
<g class="m10b-col" style="animation-delay:-4s">
<rect x="414" y="70" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="446" y="92" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
<rect x="414" y="108" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="446" y="130" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
<rect x="414" y="146" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="446" y="168" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="414" y="184" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="446" y="206" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="414" y="222" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="446" y="244" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="414" y="260" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="446" y="282" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
</g>
<g class="m10b-col" style="animation-delay:-3s">
<rect x="480" y="70" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="512" y="92" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="480" y="108" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="512" y="130" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="480" y="146" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="512" y="168" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="480" y="184" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="512" y="206" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="480" y="222" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="512" y="244" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
<rect x="480" y="260" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="512" y="282" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
</g>
<g class="m10b-col" style="animation-delay:-2s">
<rect x="546" y="70" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="578" y="92" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="546" y="108" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="578" y="130" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="546" y="146" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="578" y="168" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
<rect x="546" y="184" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="578" y="206" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
<rect x="546" y="222" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="578" y="244" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
<rect x="546" y="260" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="578" y="282" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
</g>
<g class="m10b-col" style="animation-delay:-1s">
<rect x="612" y="70" width="64" height="36" rx="3" fill="#2c7be5"/>
<text x="644" y="92" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">A</text>
<rect x="612" y="108" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="644" y="130" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="612" y="146" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="644" y="168" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="612" y="184" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="644" y="206" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="612" y="222" width="64" height="36" rx="3" fill="#16a34a"/>
<text x="644" y="244" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">B</text>
<rect x="612" y="260" width="64" height="36" rx="3" fill="#f59e0b"/>
<text x="644" y="282" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff">C</text>
</g>
<g class="m10b-sweep">
<rect x="150" y="64" width="64" height="234" rx="4" fill="#7c3aed" fill-opacity="0.12" stroke="#7c3aed" stroke-width="2.5"/>
<text x="182" y="58" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#7c3aed">TTI</text>
</g>
<text class="m10b-ax" x="360" y="322" text-anchor="middle">time → (each column = one 1 ms TTI; the tower redraws the grid each column)</text>
<rect x="150" y="330" width="14" height="10" rx="2" fill="#2c7be5"/><text class="m10b-leg" x="170" y="339" fill="#2c7be5">User A</text>
<rect x="270" y="330" width="14" height="10" rx="2" fill="#16a34a"/><text class="m10b-leg" x="290" y="339" fill="#16a34a">User B</text>
<rect x="390" y="330" width="14" height="10" rx="2" fill="#f59e0b"/><text class="m10b-leg" x="410" y="339" fill="#f59e0b">User C</text>
<rect x="510" y="330" width="14" height="10" rx="2" fill="#cbd5e1"/><text class="m10b-leg" x="530" y="339" fill="#64748b">idle</text>
</svg>
<figcaption>The air interface is a 2-D grid of <b>time × frequency</b>. Each cell is a resource block; the purple <b>TTI</b> cursor is the scheduler stepping through time, and every millisecond it hands fresh blocks to different users (colours). Unlike Wi-Fi's free-for-all, <i>the tower decides</i> who gets what, every 1 ms.</figcaption>
</figure>

## 5. Modulation, coding, and MCS: how many bits per RE

Each RE carries one modulation symbol, and Module 02's rule applies directly — richer
constellations pack more bits per symbol, but need a cleaner signal:

| Modulation | Bits per RE (symbol) | Needs |
|---|---|---|
| QPSK | 2 | weak signal OK (robust) |
| 16-QAM | 4 | moderate signal |
| 64-QAM | 6 | good signal |
| 256-QAM | 8 | excellent signal (LTE-Advanced Pro) |

But modulation is only half the story. LTE also adds **forward error correction (FEC)** —
extra redundant bits (via turbo coding in LTE) so the receiver can *fix* some errors without
a retransmission. The **code rate** is the fraction of transmitted bits that are actual data
(e.g. rate 1/3 = one data bit per three transmitted bits — very robust; rate 0.9 = almost all
data — fast but fragile).

Modulation *and* code rate are bundled into a single index: the **MCS (Modulation and Coding
Scheme)**, numbered 0–28 in LTE. Low MCS = QPSK + heavy coding (robust, slow). High MCS =
256-QAM + light coding (fast, fragile). The MCS is the single knob the scheduler turns to
match the link's current quality.

### Adaptive Modulation and Coding (AMC), driven by CQI

The phone constantly measures the downlink quality and reports a **CQI (Channel Quality
Indicator)** — a 0–15 number meaning "here's the richest MCS I could currently decode
reliably." The tower reads the CQI and picks the MCS accordingly. Signal drops → CQI falls →
tower drops to a lower MCS (fewer bits/RE, more coding) to keep the link alive. Signal
improves → CQI rises → tower climbs to a higher MCS for more speed.

This is exactly the **adaptive modulation** Module 02 promised you'd meet again — but now
it's a tight, per-user feedback loop running on a millisecond timescale. It's *why* your
throughput sags as you walk away from the tower: the radio is silently retreating from
256-QAM toward QPSK to survive the falling SNR (Shannon's ceiling in action).

> ⚡ **Latency note.** CQI is a *report about the recent past*. By the time the tower acts on
> it, the channel may have changed (you moved, someone walked between you and the tower). This
> **CQI feedback lag** means the chosen MCS is always a slightly stale bet — occasionally too
> optimistic, causing a decode failure and a retransmission (Section 9). Fast-changing
> channels (high speed, e.g. a train) suffer most.

---

<figure class="anim-fig">
<svg viewBox="0 0 720 300" role="img" aria-label="Animation: adaptive modulation and coding. As the UE moves away from the eNodeB and its signal weakens, its modulation steps down from 256-QAM to 64-QAM to 16-QAM to QPSK, driven by the CQI it reports back to the tower.">
<style>
.m10c-t{font-size:13px;font-weight:700;fill:#2c7be5}
.m10c-sub{font-size:10px;fill:#64748b}
.m10c-panel{fill:#f8fafc;stroke:#cbd5e1;stroke-width:1.5}
.m10c-s1{animation:m10cs1 12s linear infinite}
.m10c-s2{animation:m10cs2 12s linear infinite}
.m10c-s3{animation:m10cs3 12s linear infinite}
.m10c-s4{animation:m10cs4 12s linear infinite}
.m10c-ue{animation:m10cmove 12s steps(4,jump-none) infinite}
.m10c-cqi{stroke:#7c3aed;stroke-width:2;fill:none;stroke-dasharray:7 6;animation:m10cants 1s linear infinite}
@keyframes m10cmove{from{transform:translateX(0)}to{transform:translateX(450px)}}
@keyframes m10cants{to{stroke-dashoffset:-26}}
@keyframes m10cs1{0%,20%{opacity:1}25%,100%{opacity:0}}
@keyframes m10cs2{0%,22%{opacity:0}27%,45%{opacity:1}50%,100%{opacity:0}}
@keyframes m10cs3{0%,47%{opacity:0}52%,70%{opacity:1}75%,100%{opacity:0}}
@keyframes m10cs4{0%,72%{opacity:0}77%,95%{opacity:1}100%{opacity:0}}
</style>
<text x="12" y="20" class="m10c-t">Adaptive Modulation and Coding: weaker signal → the tower drops to a simpler modulation</text>
<!-- eNodeB tower -->
<polygon points="44,215 66,215 61,168 49,168" fill="#64748b"/>
<line x1="55" y1="168" x2="55" y2="150" stroke="#64748b" stroke-width="2"/>
<path d="M62 150 q12 6 16 18" stroke="#2c7be5" stroke-width="2" fill="none"/>
<path d="M48 150 q-12 6 -16 18" stroke="#2c7be5" stroke-width="2" fill="none"/>
<text class="m10c-sub" x="55" y="232" text-anchor="middle">eNodeB</text>
<!-- distance axis -->
<line x1="110" y1="235" x2="648" y2="235" stroke="#cbd5e1" stroke-width="2"/>
<polygon points="648,231 658,235 648,239" fill="#cbd5e1"/>
<text class="m10c-sub" x="150" y="252" text-anchor="middle">strong signal</text>
<text class="m10c-sub" x="590" y="252" text-anchor="middle">farther → weaker signal</text>
<!-- moving UE -->
<g class="m10c-ue">
<rect x="140" y="204" width="22" height="34" rx="4" fill="#eef5ff" stroke="#2c7be5" stroke-width="2"/>
<rect x="144" y="209" width="14" height="20" rx="1" fill="#2c7be5" fill-opacity="0.35"/>
<text class="m10c-sub" x="151" y="200" text-anchor="middle" style="fill:#2c7be5;font-weight:700">UE</text>
</g>
<!-- constellation panel -->
<rect class="m10c-panel" x="285" y="42" width="150" height="122" rx="6"/>
<text class="m10c-sub" x="360" y="38" text-anchor="middle">modulation the tower selects (from CQI)</text>
<g class="m10c-s1">
<circle cx="300.9" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="57.2" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="63.8" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="70.2" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="76.8" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="83.2" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="89.8" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="96.2" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="102.8" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="109.2" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="115.8" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="122.2" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="128.8" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="135.2" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="141.8" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="148.2" r="1.8" fill="#ef4444"/>
<circle cx="300.9" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="308.8" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="316.7" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="324.6" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="332.4" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="340.3" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="348.2" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="356.1" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="363.9" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="371.8" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="379.7" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="387.6" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="395.4" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="403.3" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="411.2" cy="154.8" r="1.8" fill="#ef4444"/>
<circle cx="419.1" cy="154.8" r="1.8" fill="#ef4444"/>
<text x="360" y="184" text-anchor="middle" style="font-size:14px;font-weight:700;fill:#ef4444">256-QAM</text>
<text x="360" y="200" text-anchor="middle" style="font-size:11px;fill:#64748b">8 bits / RE  •  SNR: excellent</text>
</g>
<g class="m10c-s2">
<circle cx="304.9" cy="60.5" r="2.7" fill="#f59e0b"/>
<circle cx="320.6" cy="60.5" r="2.7" fill="#f59e0b"/>
<circle cx="336.4" cy="60.5" r="2.7" fill="#f59e0b"/>
<circle cx="352.1" cy="60.5" r="2.7" fill="#f59e0b"/>
<circle cx="367.9" cy="60.5" r="2.7" fill="#f59e0b"/>
<circle cx="383.6" cy="60.5" r="2.7" fill="#f59e0b"/>
<circle cx="399.4" cy="60.5" r="2.7" fill="#f59e0b"/>
<circle cx="415.1" cy="60.5" r="2.7" fill="#f59e0b"/>
<circle cx="304.9" cy="73.5" r="2.7" fill="#f59e0b"/>
<circle cx="320.6" cy="73.5" r="2.7" fill="#f59e0b"/>
<circle cx="336.4" cy="73.5" r="2.7" fill="#f59e0b"/>
<circle cx="352.1" cy="73.5" r="2.7" fill="#f59e0b"/>
<circle cx="367.9" cy="73.5" r="2.7" fill="#f59e0b"/>
<circle cx="383.6" cy="73.5" r="2.7" fill="#f59e0b"/>
<circle cx="399.4" cy="73.5" r="2.7" fill="#f59e0b"/>
<circle cx="415.1" cy="73.5" r="2.7" fill="#f59e0b"/>
<circle cx="304.9" cy="86.5" r="2.7" fill="#f59e0b"/>
<circle cx="320.6" cy="86.5" r="2.7" fill="#f59e0b"/>
<circle cx="336.4" cy="86.5" r="2.7" fill="#f59e0b"/>
<circle cx="352.1" cy="86.5" r="2.7" fill="#f59e0b"/>
<circle cx="367.9" cy="86.5" r="2.7" fill="#f59e0b"/>
<circle cx="383.6" cy="86.5" r="2.7" fill="#f59e0b"/>
<circle cx="399.4" cy="86.5" r="2.7" fill="#f59e0b"/>
<circle cx="415.1" cy="86.5" r="2.7" fill="#f59e0b"/>
<circle cx="304.9" cy="99.5" r="2.7" fill="#f59e0b"/>
<circle cx="320.6" cy="99.5" r="2.7" fill="#f59e0b"/>
<circle cx="336.4" cy="99.5" r="2.7" fill="#f59e0b"/>
<circle cx="352.1" cy="99.5" r="2.7" fill="#f59e0b"/>
<circle cx="367.9" cy="99.5" r="2.7" fill="#f59e0b"/>
<circle cx="383.6" cy="99.5" r="2.7" fill="#f59e0b"/>
<circle cx="399.4" cy="99.5" r="2.7" fill="#f59e0b"/>
<circle cx="415.1" cy="99.5" r="2.7" fill="#f59e0b"/>
<circle cx="304.9" cy="112.5" r="2.7" fill="#f59e0b"/>
<circle cx="320.6" cy="112.5" r="2.7" fill="#f59e0b"/>
<circle cx="336.4" cy="112.5" r="2.7" fill="#f59e0b"/>
<circle cx="352.1" cy="112.5" r="2.7" fill="#f59e0b"/>
<circle cx="367.9" cy="112.5" r="2.7" fill="#f59e0b"/>
<circle cx="383.6" cy="112.5" r="2.7" fill="#f59e0b"/>
<circle cx="399.4" cy="112.5" r="2.7" fill="#f59e0b"/>
<circle cx="415.1" cy="112.5" r="2.7" fill="#f59e0b"/>
<circle cx="304.9" cy="125.5" r="2.7" fill="#f59e0b"/>
<circle cx="320.6" cy="125.5" r="2.7" fill="#f59e0b"/>
<circle cx="336.4" cy="125.5" r="2.7" fill="#f59e0b"/>
<circle cx="352.1" cy="125.5" r="2.7" fill="#f59e0b"/>
<circle cx="367.9" cy="125.5" r="2.7" fill="#f59e0b"/>
<circle cx="383.6" cy="125.5" r="2.7" fill="#f59e0b"/>
<circle cx="399.4" cy="125.5" r="2.7" fill="#f59e0b"/>
<circle cx="415.1" cy="125.5" r="2.7" fill="#f59e0b"/>
<circle cx="304.9" cy="138.5" r="2.7" fill="#f59e0b"/>
<circle cx="320.6" cy="138.5" r="2.7" fill="#f59e0b"/>
<circle cx="336.4" cy="138.5" r="2.7" fill="#f59e0b"/>
<circle cx="352.1" cy="138.5" r="2.7" fill="#f59e0b"/>
<circle cx="367.9" cy="138.5" r="2.7" fill="#f59e0b"/>
<circle cx="383.6" cy="138.5" r="2.7" fill="#f59e0b"/>
<circle cx="399.4" cy="138.5" r="2.7" fill="#f59e0b"/>
<circle cx="415.1" cy="138.5" r="2.7" fill="#f59e0b"/>
<circle cx="304.9" cy="151.5" r="2.7" fill="#f59e0b"/>
<circle cx="320.6" cy="151.5" r="2.7" fill="#f59e0b"/>
<circle cx="336.4" cy="151.5" r="2.7" fill="#f59e0b"/>
<circle cx="352.1" cy="151.5" r="2.7" fill="#f59e0b"/>
<circle cx="367.9" cy="151.5" r="2.7" fill="#f59e0b"/>
<circle cx="383.6" cy="151.5" r="2.7" fill="#f59e0b"/>
<circle cx="399.4" cy="151.5" r="2.7" fill="#f59e0b"/>
<circle cx="415.1" cy="151.5" r="2.7" fill="#f59e0b"/>
<text x="360" y="184" text-anchor="middle" style="font-size:14px;font-weight:700;fill:#f59e0b">64-QAM</text>
<text x="360" y="200" text-anchor="middle" style="font-size:11px;fill:#64748b">6 bits / RE  •  SNR: good</text>
</g>
<g class="m10c-s3">
<circle cx="312.8" cy="67.0" r="4.5" fill="#2c7be5"/>
<circle cx="344.2" cy="67.0" r="4.5" fill="#2c7be5"/>
<circle cx="375.8" cy="67.0" r="4.5" fill="#2c7be5"/>
<circle cx="407.2" cy="67.0" r="4.5" fill="#2c7be5"/>
<circle cx="312.8" cy="93.0" r="4.5" fill="#2c7be5"/>
<circle cx="344.2" cy="93.0" r="4.5" fill="#2c7be5"/>
<circle cx="375.8" cy="93.0" r="4.5" fill="#2c7be5"/>
<circle cx="407.2" cy="93.0" r="4.5" fill="#2c7be5"/>
<circle cx="312.8" cy="119.0" r="4.5" fill="#2c7be5"/>
<circle cx="344.2" cy="119.0" r="4.5" fill="#2c7be5"/>
<circle cx="375.8" cy="119.0" r="4.5" fill="#2c7be5"/>
<circle cx="407.2" cy="119.0" r="4.5" fill="#2c7be5"/>
<circle cx="312.8" cy="145.0" r="4.5" fill="#2c7be5"/>
<circle cx="344.2" cy="145.0" r="4.5" fill="#2c7be5"/>
<circle cx="375.8" cy="145.0" r="4.5" fill="#2c7be5"/>
<circle cx="407.2" cy="145.0" r="4.5" fill="#2c7be5"/>
<text x="360" y="184" text-anchor="middle" style="font-size:14px;font-weight:700;fill:#2c7be5">16-QAM</text>
<text x="360" y="200" text-anchor="middle" style="font-size:11px;fill:#64748b">4 bits / RE  •  SNR: fair</text>
</g>
<g class="m10c-s4">
<circle cx="328.5" cy="80.0" r="7" fill="#16a34a"/>
<circle cx="391.5" cy="80.0" r="7" fill="#16a34a"/>
<circle cx="328.5" cy="132.0" r="7" fill="#16a34a"/>
<circle cx="391.5" cy="132.0" r="7" fill="#16a34a"/>
<text x="360" y="184" text-anchor="middle" style="font-size:14px;font-weight:700;fill:#16a34a">QPSK</text>
<text x="360" y="200" text-anchor="middle" style="font-size:11px;fill:#64748b">2 bits / RE  •  SNR: weak (robust)</text>
</g>
<!-- CQI feedback loop -->
<path class="m10c-cqi" d="M520 262 Q300 292 78 250"/>
<polygon points="78,250 90,246 88,258" fill="#7c3aed"/>
<text class="m10c-sub" x="330" y="288" text-anchor="middle" style="fill:#7c3aed;font-weight:700">CQI feedback: UE reports link quality → eNodeB picks the MCS</text>
</svg>
<figcaption>As the phone walks away and its SNR falls, the tower <b>retreats down the modulation ladder</b> — 256-QAM → 64-QAM → 16-QAM → QPSK — trading bits-per-symbol for robustness. The loop is driven by the <b>CQI</b> the UE reports back: this is Shannon's ceiling acting in real time, and why throughput sags at the cell edge.</figcaption>
</figure>

## 6. MIMO: using multiple antennas

Module 02's Shannon limit says capacity = bandwidth × log₂(1 + SNR). **MIMO (Multiple-Input
Multiple-Output)** cheats it by adding a *third* dimension — space — via multiple antennas at
both ends. Three distinct uses:

- **Spatial multiplexing** — send *different* data streams simultaneously on the same
  subcarriers from different antennas. With 2×2 MIMO you can (in good conditions with enough
  multipath scattering) roughly *double* throughput; 4×4 quadruples it. Each independent
  stream is a **layer**. This is where LTE's headline peak rates come from.
- **Transmit diversity** — send the *same* data over multiple antennas with different coding,
  so if one path fades the other survives. Trades speed for **reliability** — used when the
  signal is weak.
- **Beamforming** — combine antennas to *steer* the signal's energy toward a specific user
  instead of radiating everywhere. More signal on target, less interference to others.

Ironically MIMO *needs* multipath — the very thing OFDM fought. Rich scattering makes the
antenna paths independent enough to separate the streams. In a wide-open field with one clean
path, spatial multiplexing collapses back toward a single stream.

---

## 7. The physical channels and signals

The grid isn't all user data. LTE overlays a set of **physical channels** (carrying
information) and **physical signals** (fixed patterns for sync and measurement) onto the same
time-frequency grid. The essential ones:

| Name | Direction | Carries |
|---|---|---|
| **PSS / SSS** (Primary/Secondary Sync Signals) | DL | fixed patterns the phone finds first to lock onto timing and identify the cell |
| **PBCH** (Physical Broadcast Channel) | DL | the **MIB** — minimal system info (bandwidth, frame number) every phone needs to start |
| **Reference signals** (pilots / CRS) | DL/UL | known symbols sprinkled in the grid so the receiver can estimate the channel and measure quality (they feed **RSRP/RSRQ** and CQI) |
| **PDCCH** (Physical Downlink Control Channel) | DL | **scheduling grants** — "user X, your data is in these RBs with this MCS." The control plane of the air interface. |
| **PDSCH** (Physical Downlink Shared Channel) | DL | the actual **downlink user data** |
| **PUCCH** (Physical Uplink Control Channel) | UL | uplink control: CQI reports, HARQ ACK/NACK, scheduling requests |
| **PUSCH** (Physical Uplink Shared Channel) | UL | the actual **uplink user data** |

The word **Shared** in PDSCH/PUSCH is the whole point: these channels are a *common pool* the
scheduler divides among users each TTI — not dedicated pipes. And **PDCCH is the key that
unlocks PDSCH**: a phone must first decode a grant on PDCCH telling it *where in the grid* its
data sits, before it can read PDSCH. No grant, no data.

> **Startup sequence (why PSS/SSS/PBCH come first).** A phone powering on knows nothing. It
> scans for **PSS/SSS** to find a cell and lock timing, reads **PBCH** for the basic
> parameters, then listens on **PDCCH** for grants. Only then can user data flow on PDSCH.
> Module 11 covers what happens *above* this; Module 12 covers finding and switching cells.

---

## 8. The eNodeB scheduler: the heart of "who transmits when"

Here is the defining difference between cellular and everything in Modules 03 and 08. On the
shared grid, *someone* must decide, every single millisecond, which phone gets which resource
blocks and at what MCS. In LTE that someone is the **scheduler in the eNodeB** (the tower).

Every 1 ms TTI it runs a loop:

```mermaid
flowchart LR
  A["UEs measure downlink<br/>from reference signals"] --> B["UEs report CQI + buffer status<br/>on PUCCH/PUSCH"]
  B --> C["eNodeB SCHEDULER<br/>(every 1 ms TTI)<br/>who gets which RBs?<br/>which MCS?"]
  C --> D["Send GRANTS on PDCCH<br/>'UE X -> RBs 10-20, MCS 17'"]
  D --> E["Send DATA on PDSCH<br/>in the granted RBs"]
  E --> F["UE decodes, sends<br/>ACK/NACK + fresh CQI"]
  F --> A
```

The scheduler juggles competing goals every millisecond: **throughput** (favor users with
good channels — they carry more bits per RB), **fairness** (don't starve the user at the cell
edge), and **latency** (a voice packet can't wait). Real schedulers use policies like
*proportional fair* to balance these. It also picks the MCS per user from their CQI (Section 5)
and steers beams (Section 6).

Contrast the three media you now know:

| Medium | Who decides who talks | Mechanism | Result |
|---|---|---|---|
| **Ethernet** (Module 03) | nobody / the switch | CSMA/CD, then per-port full-duplex | collisions historically; now none |
| **Wi-Fi** (Module 08) | nobody — devices contend | **CSMA/CA**: listen, random backoff, hope | works, but collisions & backoff add random jitter under load |
| **LTE** | **the eNodeB, centrally** | **scheduling** every 1 ms | no contention, no collisions; predictable, tunable per-user |

> ⚡ **Latency note — this is the big one.** Wi-Fi's CSMA/CA is *contention*: under load,
> devices back off random amounts and delay is unpredictable (jitter, Module 02). LTE
> *eliminates the free-for-all* — the tower grants airtime, so there are no data collisions
> and latency is controllable. **But** it adds its own floors: the **1 ms TTI granularity**
> (you wait for the next slot boundary), and if the phone had nothing scheduled it must send a
> **scheduling request** on PUCCH and wait for a grant before it can even transmit — a
> round-trip *before* the data moves. So cellular trades Wi-Fi's random contention delay for a
> smaller, *bounded, structured* delay. Predictability, not zero.

This central-scheduling idea is the thread of Part IV: it's why cellular can guarantee quality
for voice, prioritize traffic, and pack a cell full of users without them stepping on each
other — things a contention-based medium simply cannot promise.

---

## 9. HARQ: retransmission that reuses failed attempts

Radio loses data constantly (Module 02). Waiting for TCP (Module 05) to notice and resend
would be far too slow — the round-trip is enormous by radio standards. So LTE retransmits
right down at the PHY/MAC layer with **HARQ (Hybrid Automatic Repeat reQuest)**.

The basic ARQ part: every transport block carries a CRC. The receiver checks it and sends
back **ACK** (good) or **NACK** (corrupt) on PUCCH. NACK → the sender retransmits.

The **"Hybrid" / soft-combining** part is the clever bit: a failed block is **not thrown
away**. The receiver *keeps* the garbled signal, and when the retransmission arrives, it
**combines** the two noisy copies before decoding. Two weak, corrupt copies added together
often decode perfectly where neither could alone — you accumulate signal energy across
attempts. (Retransmissions may even send *different* redundancy bits — *incremental
redundancy* — making each retry more informative.)

LTE runs several HARQ processes in parallel (typically 8) so it doesn't stall waiting for one
ACK — while process 1 waits for its ACK, processes 2–8 keep sending.

> ⚡ **Latency note.** A HARQ round-trip in LTE is about **8 ms** (send → decode → ACK/NACK →
> retransmit). Each retransmission adds roughly that. This is a real, named term in your
> Module 02 delay budget: it's *below* TCP, invisible to it, but it directly inflates the
> effective RTT the transport layer sees. A few HARQ retries on a bad link can quietly add
> tens of milliseconds. Module 13 will attribute end-to-end latency using exactly these terms.

---

## 10. A quick look ahead: 5G NR deltas

5G New Radio (NR) keeps this whole framework — OFDM grid, resource blocks, scheduling, AMC,
HARQ, MIMO — and relaxes the fixed constants:

- **Flexible numerology.** LTE fixed subcarrier spacing at 15 kHz. NR allows 15, 30, 60, 120
  kHz (and more). Wider spacing = shorter symbols = **shorter slots** = lower latency and
  support for very high frequencies. A 1 ms TTI is no longer sacred.
- **mmWave.** NR adds spectrum in the **millimeter-wave** bands (24 GHz+) with huge bandwidth
  (hundreds of MHz) for multi-gigabit speeds — at the cost of tiny range and poor wall
  penetration, so it needs dense small cells.
- **Massive MIMO.** Dozens to hundreds of antenna elements enable aggressive beamforming and
  many spatial layers — especially vital at mmWave to overcome path loss.

The mindset transfers wholesale: if you understand the LTE grid, scheduler, and HARQ loop,
5G NR is "the same machine with tunable knobs."

---

## Misconceptions to kill

- ❌ *"OFDM sends data on one big carrier."* The opposite — it splits the channel into ~1200
  narrow 15 kHz subcarriers precisely to *avoid* one fast carrier's multipath problem.
- ❌ *"The cyclic prefix carries data."* No — it's a disposable guard interval that absorbs
  echoes. Pure overhead you pay to beat ISI.
- ❌ *"MIMO makes the signal stronger."* Spatial multiplexing sends *different* streams for
  more speed; it's not "more power." (Diversity and beamforming *do* improve robustness.)
- ❌ *"Phones grab airtime like Wi-Fi does."* No — the eNodeB *grants* every transmission.
  There's no contention or collision on LTE data channels; a phone can't transmit user data
  without a scheduling grant.
- ❌ *"HARQ throws away failed packets and resends fresh."* No — it *keeps* the failed copy and
  soft-combines it with the retransmission. That's the "hybrid" part.
- ❌ *"More bandwidth always means more speed here."* Only if SNR supports a high MCS. A weak
  signal forces low MCS regardless of how many RBs you're given — Shannon still rules.

---

## Check your understanding

<div class="quiz">
<p class="q">Why does LTE split its channel into ~1200 narrow 15 kHz subcarriers instead of using one wide carrier?</p>
<ul class="options">
<li data-correct="true">Narrow subcarriers carry slow, long symbols, so multipath echoes are a tiny fraction of a symbol — this defeats inter-symbol interference.</li>
<li>Narrow carriers are legally required by spectrum regulators.</li>
<li>It lets the phone use a smaller, cheaper antenna.</li>
</ul>
<div class="explain">A single wide carrier means very short symbols, which multipath echoes smear
into each other (ISI). OFDM's many slow subcarriers make each symbol long, so a late echo
barely overlaps the next symbol — and the cyclic prefix mops up what's left. That's the whole
reason OFDM exists.</div>
</div>

<div class="quiz">
<p class="q">On the LTE downlink, how does a phone know which resource blocks contain *its* data?</p>
<ul class="options">
<li>It listens to the whole grid and filters by its MAC address.</li>
<li data-correct="true">It decodes a scheduling grant on the PDCCH that points to specific RBs and an MCS, then reads its data from the PDSCH.</li>
<li>Every phone gets a fixed, permanently assigned set of resource blocks.</li>
</ul>
<div class="explain">The eNodeB scheduler sends grants on the <strong>PDCCH</strong> ("UE X → RBs
10–20, MCS 17"). Only after decoding its grant does the phone know where in the shared PDSCH
its data sits. No grant, no data — the shared channel is re-divided every 1 ms TTI.</div>
</div>

<div class="quiz">
<p class="q">How is LTE's approach to "who transmits when" fundamentally different from Wi-Fi's CSMA/CA?</p>
<ul class="options">
<li>LTE devices listen before transmitting and back off randomly, just faster.</li>
<li data-correct="true">LTE has no contention — the eNodeB centrally schedules every transmission each 1 ms TTI, so there are no data collisions or random backoff.</li>
<li>LTE lets every device transmit whenever it wants and fixes collisions afterward.</li>
</ul>
<div class="explain">Wi-Fi (Module 08) uses contention: devices sense the medium and back off
random amounts, which adds unpredictable jitter under load. LTE eliminates the free-for-all —
the tower grants airtime centrally, so data never collides. The trade is a bounded, structured
delay (the 1 ms TTI, and a scheduling-request round-trip if you had nothing scheduled).</div>
</div>

---

## Exercises

1. **Read your radio's vitals.** On Android, dial `*#*#4636#*#*` (or install a *network
   monitor* / *cell info* app) and find **RSRP**, **RSRQ**, and **SINR/SNR**. On iPhone, dial
   `*3001#12345#*` for Field Test mode. Note the values indoors vs by a window. Watch RSRP
   (signal power) climb and RSRQ/SINR (quality) improve as you get a clearer path — this is
   the input to CQI.

2. **Correlate quality with modulation.** Using an engineering app that exposes it (e.g.
   Network Signal Guru on a rooted Android, or SigCap), watch the **MCS / modulation order**
   the tower assigns you. Move from a strong-signal spot to a weak one and watch it fall from
   256-/64-QAM toward QPSK. You're watching **AMC** respond to your **CQI** in real time.

3. **Identify your band and EARFCN.** From the field-test data, note your serving **band**
   (e.g. B2, B66, n78) and **EARFCN** (the channel number). Look the EARFCN up in any online
   EARFCN/band calculator to find the exact center frequency and channel bandwidth. Tie the
   bandwidth back to the RB count in Section 4's table.

4. **Estimate a resource block count.** From your channel bandwidth, use Section 4 to state how
   many RBs exist per slot and roughly how many REs that is per millisecond. Then reason:
   at your observed MCS, roughly how many bits/RE — a back-of-envelope peak throughput.

5. **🔧 Project — watch the scheduler breathe.** Run a large download and, with a monitoring
   app, watch your allocated RB count and MCS change moment to moment. Note how they *rise*
   when you have data to move and the channel is good, and drop when idle or when signal
   fades. You're observing the eNodeB scheduler's per-TTI decisions from the outside.

6. **🔧 Project (future hardware).** Note for later: an **SDR** (software-defined radio, e.g.
   RTL-SDR from Module 02, or a LimeSDR) plus open tooling can decode LTE's **PSS/SSS/PBCH**
   and even show the live resource grid. A hands-on way to *see* Sections 4 and 7.

---

## Key terms

- **OFDM** — Orthogonal Frequency-Division Multiplexing: split a channel into many narrow,
  non-interfering subcarriers carrying slow parallel symbol streams; defeats multipath.
- **OFDMA** — OFDM used as *multiple access* on the downlink: different users get different
  subcarriers/time.
- **SC-FDMA** — the low-PAPR uplink variant of OFDM, chosen to save phone battery.
- **Subcarrier** — one 15 kHz frequency slice of the OFDM grid.
- **Cyclic prefix (CP)** — a copied guard interval prepended to each symbol to absorb echoes.
- **Resource Element (RE)** — one subcarrier × one OFDM symbol; carries one modulation symbol.
- **OFDM symbol** — one time-column of the grid (~71 µs); 7 per slot.
- **Resource Block (RB) / PRB** — 12 subcarriers × one 0.5 ms slot (= 84 REs); the unit the
  scheduler allocates.
- **Slot** — 0.5 ms, 7 OFDM symbols. **Subframe** — 1 ms = 2 slots = one **TTI**. **Frame** —
  10 ms.
- **TTI (Transmission Time Interval)** — the 1 ms scheduling heartbeat.
- **MCS (Modulation and Coding Scheme)** — index (0–28) bundling modulation order + code rate.
- **Code rate** — fraction of transmitted bits that are actual data (rest is error-correction).
- **AMC** — Adaptive Modulation and Coding: pick the richest MCS the channel currently allows.
- **CQI (Channel Quality Indicator)** — the phone's 0–15 report of the best MCS it can decode.
- **RSRP / RSRQ / SINR** — measured signal power / quality / signal-to-interference-plus-noise.
- **MIMO** — multiple antennas for spatial multiplexing (speed), diversity (robustness), or
  beamforming (steering).
- **PDSCH / PUSCH** — physical downlink/uplink *shared* channels: user data.
- **PDCCH / PUCCH** — physical downlink/uplink *control* channels: grants, ACK/NACK, CQI.
- **PBCH** — broadcast channel (basic system info). **PSS/SSS** — sync signals a phone finds
  first. **Reference signals** — known pilot symbols for channel estimation.
- **HARQ** — Hybrid ARQ: PHY/MAC retransmission that *soft-combines* failed copies.
- **eNodeB** — the LTE base station (tower) that runs the scheduler.
- **EARFCN** — the number identifying an LTE carrier's frequency/channel.

---

## Cheat-sheet

```
THE LTE AIR INTERFACE (Uu / PHY) — bits across the radio

OFDM (why): one fast carrier dies to multipath (ISI). Fix = many SLOW subcarriers.
  ~1200 subcarriers @ 15 kHz, orthogonal (overlap but don't interfere), decoded via FFT.
  Cyclic Prefix (CP) = copied guard interval that absorbs echoes (~7% overhead).
  Downlink = OFDMA (users get different subcarriers). Uplink = SC-FDMA (low PAPR = battery).

THE RESOURCE GRID (2-D: frequency x time)
  RE   = 1 subcarrier x 1 OFDM symbol  = one modulation symbol
  RB   = 12 subcarriers x 0.5 ms slot  = 84 REs   <- scheduler's unit (aka PRB)
  slot = 0.5 ms, 7 OFDM symbols
  subframe = 1 ms = 2 slots = 1 TTI    <- scheduling heartbeat
  frame = 10 ms
  bandwidth -> RBs:  1.4MHz=6 · 3=15 · 5=25 · 10=50 · 15=75 · 20=100  (aggregate for more)

MODULATION & CODING
  bits/RE:  QPSK 2 · 16-QAM 4 · 64-QAM 6 · 256-QAM 8   (need cleaner signal going up)
  code rate = data / transmitted bits (rest = FEC)
  MCS (0-28) = modulation + code rate bundled
  AMC loop: phone reports CQI -> tower picks MCS. Weak signal -> lower MCS (Shannon).

MIMO = extra antennas:  spatial multiplexing (speed) | diversity (robust) | beamforming (steer)

PHYSICAL CHANNELS/SIGNALS
  DL: PSS/SSS (sync) · PBCH (broadcast) · PDCCH (GRANTS) · PDSCH (DATA) · reference signals
  UL: PUCCH (CQI/ACK/req) · PUSCH (DATA)
  Rule: decode grant on PDCCH FIRST -> then read your data on PDSCH.

THE SCHEDULER (the heart)  -- eNodeB decides every 1 ms TTI:
  who gets which RBs + which MCS. Goals: throughput vs fairness vs latency.
  vs Ethernet CSMA/CD, vs Wi-Fi CSMA/CA (contention) -> LTE = NO contention, central grants.

HARQ (retransmit at PHY/MAC)
  CRC -> ACK/NACK. Failed copy is KEPT and SOFT-COMBINED with retransmit (hybrid).
  ~8 ms per HARQ round-trip; 8 parallel processes so it never stalls.

LATENCY FLOORS ADDED HERE: CP overhead · 1 ms TTI granularity · scheduling-request RTT ·
  CQI feedback lag · ~8 ms per HARQ retry.  (All feed Module 13's end-to-end budget.)

5G NR DELTAS: flexible numerology (15/30/60/120 kHz) · mmWave (24 GHz+, huge BW, short range) ·
  massive MIMO. Same machine, tunable knobs.
```

---

**Next up → Module 11: The LTE Protocol Stack** — the PHY got bits across the radio; now
what sits *on top* of it? MAC (scheduling & HARQ control), RLC (retransmission & reordering),
PDCP (header compression, ciphering), and how a "bearer" carries your IP packets over the air.
The same four L2 jobs from Module 03 — framing, addressing, media access, error handling —
rebuilt for the hostile radio channel.
