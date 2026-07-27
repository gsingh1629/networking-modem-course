# Module 01 — The Layered Model

> **The one idea to keep:** A network is not one giant machine. It's a stack of small,
> independent problem-solvers, each doing one job and handing the result to the layer
> below it. Every layer talks *as if* it's speaking directly to its twin on the other
> machine, even though the real data physically travels all the way down and back up.

This module is the **map**. Every later module zooms into one region of it. If you
internalize this module, everything else has a place to hang.

---

## 1. Why layers exist at all (the software-engineer version)

You already know this pattern. It's the same reason you don't write a web app as one
10,000-line function.

Imagine you had to send a message to a friend across the world and you had to solve
*everything at once*:

- How do I turn "hello" into voltage/light/radio?
- How do I make sure the cable/air didn't corrupt it?
- How do I find *which* machine, out of billions, is my friend's?
- How do I make sure nothing got lost or arrived out of order?
- How does the *app* (say, WhatsApp) know this message is for it and not for the browser?

That's an impossible tangle if solved as one blob. So networking is designed as a
**stack of layers**, where each layer:

1. Solves exactly **one class of problem**.
2. Offers a **clean service** to the layer above ("give me your data, I'll get it to the
   right machine" — don't ask how).
3. Depends only on the **service of the layer below** (not its internals).

> This is just **abstraction + separation of concerns + dependency inversion** — the
> exact principles you use in code. A layer is an interface; you can swap the
> implementation underneath (Wi-Fi → Ethernet → 4G) without the layers above noticing.

**Why this matters practically:** it's why your Python `requests.get()` works identically
whether you're on fiber, hotel Wi-Fi, or a 4G phone. The app layer never changes. Only
the bottom layers swap out. That swappability *is* the whole point.

---

## 2. Two models: OSI (the teaching model) and TCP/IP (the real one)

There are two layer models you'll hear about. You need both, for different reasons.

### The OSI 7-layer model — the vocabulary everyone uses

Nobody's internet is *literally* built as 7 layers, but the whole industry uses OSI
**numbers and names** to talk. When someone says "that's a Layer 3 device" or "an L7
load balancer," they mean OSI. So learn it as vocabulary.

```
   OSI MODEL                          "What's its job?"                Example
 ┌────────────────────┐
 │ 7  Application      │   The actual app protocol                   HTTP, DNS, SMTP
 ├────────────────────┤
 │ 6  Presentation    │   Data format / encryption / compression    TLS, JPEG, UTF-8
 ├────────────────────┤
 │ 5  Session         │   Start/stop/resume a conversation          (rarely its own layer)
 ├────────────────────┤
 │ 4  Transport       │   End-to-end delivery between programs       TCP, UDP, QUIC
 ├────────────────────┤
 │ 3  Network         │   Find the right MACHINE across networks     IP, ICMP, routing
 ├────────────────────┤
 │ 2  Data Link       │   Get a frame across ONE hop/link           Ethernet, Wi-Fi, ARP
 ├────────────────────┤
 │ 1  Physical        │   Actual bits as signals                    copper, fiber, radio
 └────────────────────┘
```

**Memory hooks (top→bottom):** "All People Seem To Need Data Processing."
(Application, Presentation, Session, Transport, Network, Data link, Physical.)

### The TCP/IP model — how the internet is actually built

The real internet was designed around TCP/IP, which collapses OSI into **4 layers**.
This is the model that matches reality:

```
   TCP/IP MODEL              maps to OSI              What lives here
 ┌────────────────────┐
 │ Application         │  = OSI 5,6,7               HTTP, DNS, TLS, everything an app speaks
 ├────────────────────┤
 │ Transport          │  = OSI 4                    TCP, UDP, QUIC
 ├────────────────────┤
 │ Internet           │  = OSI 3                    IP, ICMP
 ├────────────────────┤
 │ Link (Net access)  │  = OSI 1 + 2                Ethernet, Wi-Fi, 4G radio + the wire
 └────────────────────┘
```

> **How to hold both in your head:** Use **OSI numbers to talk** ("L2 switch", "L4 load
> balancer", "L7 firewall") and the **TCP/IP 4-layer split to reason about how packets
> actually work**. When we get to cellular, the LTE stack (PDCP/RLC/MAC/PHY) is basically
> a very elaborate expansion of the TCP/IP **Link layer** — it's all the machinery to make
> "one hop" work over radio. Keep that in your pocket; it'll pay off in Module 11.

---

## 3. The core mechanic: encapsulation (this is *the* thing to understand)

Here is how data actually moves down the stack. Each layer takes the data from above and
**wraps it in its own header** (and sometimes a trailer) — like nesting envelopes.

Say your browser sends `GET /index.html`:

```
 Sender (your laptop)                              going DOWN the stack

 App layer:      [ GET /index.html ]                         ← the actual data ("payload")
                          │  hand down
 Transport (TCP):[TCP hdr][ GET /index.html ]                ← adds ports, seq numbers
                          │  hand down
 Network (IP):   [IP hdr][TCP hdr][ GET /index.html ]        ← adds source/dest IP address
                          │  hand down
 Link (Ethernet):[Eth hdr][IP hdr][TCP hdr][ data ][Eth trl] ← adds MAC addrs + checksum
                          │  hand down
 Physical:       101000111010101110100011...                 ← bits on the wire/air
```

Each wrapper is called a **header**. The whole wrapped thing has a name at each layer
(this vocabulary matters — people use it precisely):

| Layer          | What the unit is called (a **PDU**) |
|----------------|-------------------------------------|
| Application    | **data** / message                  |
| Transport      | **segment** (TCP) / **datagram** (UDP) |
| Network        | **packet**                          |
| Link           | **frame**                           |
| Physical       | **bits / symbols**                  |

(**PDU** = Protocol Data Unit = "the chunk of stuff a given layer deals with." Just
jargon for "the thing at this layer.")

On the receiving machine, the exact reverse happens — **decapsulation**. Each layer reads
*its own* header, strips it off, and hands the inside up to the next layer:

```
 Receiver (the server)                             going UP the stack

 Physical:       ...10100011...            → reconstruct bits
 Link:           reads Eth hdr → "is this frame for my MAC? checksum ok?" → strip → up
 Network:        reads IP hdr  → "is this packet for my IP?"              → strip → up
 Transport:      reads TCP hdr → "which port/program? in-order? reassemble" → strip → up
 App:            [ GET /index.html ]  → hand to the web server process
```

> **The killer insight — "virtual peer conversations":** Even though data physically goes
> all the way down to bits and back up, *each layer behaves as if it's talking straight to
> its counterpart on the other machine.* TCP on your laptop "talks to" TCP on the server
> (sequence numbers, acks). IP "talks to" IP (addresses). They ignore everything below
> them. This is why you can reason about one layer at a time — the abstraction genuinely
> holds. Draw it as horizontal dashed lines between twins:
>
> ```
>   App  <----- virtual conversation ----->  App
>   TCP  <----- virtual conversation ----->  TCP
>   IP   <----- virtual conversation ----->  IP
>   Link <-- real physical link (1 hop) -->  Link
> ```

<figure class="anim-fig">
<svg viewBox="0 0 760 320" role="img" aria-label="Animation: data travels physically down Host A's stack, across the wire, and up Host B's stack — while each layer behaves as if talking directly to its twin.">
<style>
.p1-h{font-size:13px;font-weight:700;fill:#1f2d3d}
.p1-ll{font-size:12px;font-weight:600;fill:#fff}
.p1-note{font-size:11px;fill:#8595a7}
.p1-peer{stroke:#94a3b8;stroke-width:2;stroke-dasharray:7 6;fill:none;animation:p1ants 1s linear infinite}
.p1-tok{animation:p1tok 6s ease-in-out infinite}
@keyframes p1ants{to{stroke-dashoffset:-26}}
@keyframes p1tok{
0%{opacity:1;transform:translate(0px,0px)}
6%{opacity:1;transform:translate(0px,0px)}
30%{opacity:1;transform:translate(0px,180px)}
55%{opacity:1;transform:translate(360px,180px)}
80%{opacity:1;transform:translate(360px,0px)}
90%{opacity:1;transform:translate(360px,0px)}
95%,100%{opacity:0;transform:translate(360px,0px)}}
</style>
<text class="p1-h" x="130" y="20" text-anchor="middle">Host A</text>
<text class="p1-h" x="630" y="20" text-anchor="middle">Host B</text>
<!-- peer dashed lines (logical conversations) -->
<line class="p1-peer" x1="200" y1="60" x2="560" y2="60"/>
<line class="p1-peer" x1="200" y1="120" x2="560" y2="120"/>
<line class="p1-peer" x1="200" y1="180" x2="560" y2="180"/>
<text class="p1-note" x="380" y="52" text-anchor="middle">App ⇄ App  (logical peer conversation)</text>
<text class="p1-note" x="380" y="112" text-anchor="middle">TCP ⇄ TCP</text>
<text class="p1-note" x="380" y="172" text-anchor="middle">IP ⇄ IP</text>
<!-- Stack A -->
<g>
<rect x="60" y="46" width="140" height="28" rx="5" fill="#7c3aed"/><text class="p1-ll" x="130" y="65" text-anchor="middle">App</text>
<rect x="60" y="106" width="140" height="28" rx="5" fill="#2c7be5"/><text class="p1-ll" x="130" y="125" text-anchor="middle">TCP</text>
<rect x="60" y="166" width="140" height="28" rx="5" fill="#16a34a"/><text class="p1-ll" x="130" y="185" text-anchor="middle">IP</text>
<rect x="60" y="226" width="140" height="28" rx="5" fill="#f59e0b"/><text class="p1-ll" x="130" y="245" text-anchor="middle">Link</text>
</g>
<!-- Stack B -->
<g>
<rect x="560" y="46" width="140" height="28" rx="5" fill="#7c3aed"/><text class="p1-ll" x="630" y="65" text-anchor="middle">App</text>
<rect x="560" y="106" width="140" height="28" rx="5" fill="#2c7be5"/><text class="p1-ll" x="630" y="125" text-anchor="middle">TCP</text>
<rect x="560" y="166" width="140" height="28" rx="5" fill="#16a34a"/><text class="p1-ll" x="630" y="185" text-anchor="middle">IP</text>
<rect x="560" y="226" width="140" height="28" rx="5" fill="#f59e0b"/><text class="p1-ll" x="630" y="245" text-anchor="middle">Link</text>
</g>
<!-- real physical link -->
<line x1="130" y1="254" x2="130" y2="288" stroke="#cbd5e1" stroke-width="2"/>
<line x1="630" y1="254" x2="630" y2="288" stroke="#cbd5e1" stroke-width="2"/>
<line x1="130" y1="288" x2="630" y2="288" stroke="#0891b2" stroke-width="3"/>
<text class="p1-note" x="380" y="308" text-anchor="middle">real physical link — the ONLY place bits actually cross (1 hop)</text>
<!-- travelling token: starts at A.App (x=130,y=60) -->
<g class="p1-tok">
<circle cx="130" cy="60" r="9" fill="#ef4444"/>
<circle cx="130" cy="60" r="9" fill="#ef4444" opacity="0.35"><animate attributeName="r" values="9;15;9" dur="1s" repeatCount="indefinite"/></circle>
</g>
</svg>
<figcaption>The data really travels <b>down</b> Host A, across the one physical link, and <b>up</b> Host B (red dot). But each layer <i>behaves</i> as if chatting straight across to its twin (dashed lines) — that useful illusion is why you can reason about one layer at a time.</figcaption>
</figure>

### The same idea, as a diagram

```mermaid
flowchart TD
  subgraph SENDER["Sender — going DOWN"]
    A1["App: GET /index.html"] --> A2["Transport: [TCP hdr] + data"]
    A2 --> A3["Network: [IP hdr] + segment"]
    A3 --> A4["Link: [Eth hdr] + packet + [trailer]"]
    A4 --> A5["Physical: 1010001110…"]
  end
  A5 -->|bits travel the medium| B5
  subgraph RECEIVER["Receiver — going UP"]
    B5["Physical: 1010001110…"] --> B4["Link: check + strip Eth hdr"]
    B4 --> B3["Network: check + strip IP hdr"]
    B3 --> B2["Transport: reorder + strip TCP hdr"]
    B2 --> B1["App: GET /index.html"]
  end
```

*(This renders as a real diagram on the course site and on GitHub. Every module uses
diagrams like this — see [Contributing](CONTRIBUTING.md) if you want to add more.)*

<figure class="anim-fig">
<svg viewBox="0 0 760 388" role="img" aria-label="Animation: as data moves down the stack, each layer prepends its own header and the packet grows, until it becomes bits on the wire.">
<style>
.e1-lbl{font-size:12.5px;font-weight:600}
.e1-sub{font-size:10.5px;fill:#8595a7}
.e1-hdr{font-size:12.5px;font-weight:700;fill:#fff}
.e1-data{font-size:12px;font-weight:600;fill:#1f2d3d}
.e1-bits{font-size:14px;font-weight:700;fill:#0891b2;letter-spacing:2px}
.e1-r1{animation:e1r1 10s linear infinite}
.e1-r2{animation:e1r2 10s linear infinite}
.e1-r3{animation:e1r3 10s linear infinite}
.e1-r4{animation:e1r4 10s linear infinite}
.e1-r5{animation:e1r5 10s linear infinite}
.e1-arrow{animation:e1arrow 10s ease-in-out infinite}
.e1-shim{animation:e1shim 1.6s ease-in-out infinite}
@keyframes e1r1{0%,4%{opacity:0;transform:translateY(-14px)}9%,90%{opacity:1;transform:translateY(0)}96%,100%{opacity:0;transform:translateY(-14px)}}
@keyframes e1r2{0%,16%{opacity:0;transform:translateY(-14px)}21%,90%{opacity:1;transform:translateY(0)}96%,100%{opacity:0;transform:translateY(-14px)}}
@keyframes e1r3{0%,28%{opacity:0;transform:translateY(-14px)}33%,90%{opacity:1;transform:translateY(0)}96%,100%{opacity:0;transform:translateY(-14px)}}
@keyframes e1r4{0%,40%{opacity:0;transform:translateY(-14px)}45%,90%{opacity:1;transform:translateY(0)}96%,100%{opacity:0;transform:translateY(-14px)}}
@keyframes e1r5{0%,52%{opacity:0;transform:translateY(-14px)}57%,90%{opacity:1;transform:translateY(0)}96%,100%{opacity:0;transform:translateY(-14px)}}
@keyframes e1arrow{0%,4%{opacity:0;transform:translateY(0)}9%{opacity:1;transform:translateY(0)}52%{opacity:1;transform:translateY(248px)}90%{opacity:1;transform:translateY(248px)}96%,100%{opacity:0;transform:translateY(248px)}}
@keyframes e1shim{0%,100%{opacity:.55}50%{opacity:1}}
</style>
<text x="12" y="20" style="font-size:13px;font-weight:700;fill:#2c7be5">Encapsulation — the packet grows one header at a time, going DOWN ↓</text>
<polygon class="e1-arrow" points="118,64 130,64 124,76" fill="#ef4444"/>
<!-- Row 1: App -->
<g class="e1-r1">
<text class="e1-lbl" x="12" y="74" fill="#7c3aed">App</text><text class="e1-sub" x="12" y="88">message</text>
<rect x="320" y="52" width="240" height="40" rx="5" fill="#94a3b8"/><text class="e1-data" x="440" y="77" text-anchor="middle">DATA  (GET /)</text>
</g>
<!-- Row 2: Transport -->
<g class="e1-r2">
<text class="e1-lbl" x="12" y="136" fill="#2c7be5">Transport</text><text class="e1-sub" x="12" y="150">segment</text>
<rect x="260" y="114" width="60" height="40" rx="5" fill="#2c7be5"/><text class="e1-hdr" x="290" y="139" text-anchor="middle">TCP</text>
<rect x="320" y="114" width="240" height="40" rx="5" fill="#94a3b8"/><text class="e1-data" x="440" y="139" text-anchor="middle">DATA</text>
</g>
<!-- Row 3: Network -->
<g class="e1-r3">
<text class="e1-lbl" x="12" y="198" fill="#16a34a">Network</text><text class="e1-sub" x="12" y="212">packet</text>
<rect x="205" y="176" width="55" height="40" rx="5" fill="#16a34a"/><text class="e1-hdr" x="232" y="201" text-anchor="middle">IP</text>
<rect x="260" y="176" width="60" height="40" rx="5" fill="#2c7be5"/><text class="e1-hdr" x="290" y="201" text-anchor="middle">TCP</text>
<rect x="320" y="176" width="240" height="40" rx="5" fill="#94a3b8"/><text class="e1-data" x="440" y="201" text-anchor="middle">DATA</text>
</g>
<!-- Row 4: Link -->
<g class="e1-r4">
<text class="e1-lbl" x="12" y="260" fill="#f59e0b">Link</text><text class="e1-sub" x="12" y="274">frame</text>
<rect x="135" y="238" width="70" height="40" rx="5" fill="#f59e0b"/><text class="e1-hdr" x="170" y="263" text-anchor="middle">ETH</text>
<rect x="205" y="238" width="55" height="40" rx="5" fill="#16a34a"/><text class="e1-hdr" x="232" y="263" text-anchor="middle">IP</text>
<rect x="260" y="238" width="60" height="40" rx="5" fill="#2c7be5"/><text class="e1-hdr" x="290" y="263" text-anchor="middle">TCP</text>
<rect x="320" y="238" width="240" height="40" rx="5" fill="#94a3b8"/><text class="e1-data" x="440" y="263" text-anchor="middle">DATA</text>
<rect x="560" y="238" width="45" height="40" rx="5" fill="#fbbf24"/><text class="e1-hdr" x="582" y="263" text-anchor="middle" style="fill:#7a5200">FCS</text>
</g>
<!-- Row 5: Physical -->
<g class="e1-r5">
<text class="e1-lbl" x="12" y="322" fill="#0891b2">Physical</text><text class="e1-sub" x="12" y="336">bits</text>
<text class="e1-bits e1-shim" x="135" y="327">10110100 11010011 00101110 10011010 …</text>
</g>
</svg>
<figcaption>Watch it build: <b>App</b> hands down its message, then <b>Transport</b> wraps a TCP header, <b>Network</b> an IP header, <b>Link</b> an Ethernet header + trailer (FCS) — and finally it's just <b>bits</b> on the wire. The receiver strips these back off in reverse (decapsulation).</figcaption>
</figure>

**Why headers cost you (foreshadowing latency):** every header is *overhead* — bytes that
aren't your data. A tiny "hello" (5 bytes) rides inside ~54+ bytes of TCP/IP/Ethernet
headers. On constrained/IoT links this overhead ratio is a real design problem, and it's
exactly why cellular invents header *compression* (PDCP, Module 11).

---

## 4. What each layer's JOB is (the part you asked for: "each function")

Let's go layer by layer, top to bottom, and state the **one job** and the **key
questions** each answers. Later modules are entire deep-dives into each of these.

### L7/App — "Speak the language of the actual application"
- **Job:** define the *meaning* of the bytes for a specific application (a web request, a
  DNS lookup, an email).
- **Answers:** What does this message *mean*? What's the request/response grammar?
- **Doesn't care about:** how it gets there. It assumes a reliable pipe exists.
- Examples: HTTP, DNS, SMTP, gRPC. (Module 06.)

### L4/Transport — "Deliver reliably to the right *program*, end to end"
- **Job:** get data from a *program* on one machine to a *program* on another, and
  (for TCP) make it reliable, ordered, and flow-controlled.
- **Answers:** Which program? (via **ports** — e.g. 443 = HTTPS). Did everything arrive?
  In order? Am I sending too fast?
- **Key idea:** IP gets you to the *machine*; ports get you to the *program*. `TCP` adds
  reliability on top of unreliable IP; `UDP` doesn't (fast but lossy). (Module 05.)

### L3/Network — "Find the right machine, anywhere in the world"
- **Job:** move a packet across *many* networks from source machine to destination
  machine, choosing a path (**routing**) hop by hop.
- **Answers:** What's the destination **IP address**? Which direction (next hop) gets it
  closer? This is the only layer that thinks *globally*.
- **Key idea:** IP is **best-effort** — it does *not* guarantee delivery or order. That's
  deliberate; reliability is L4's job. (Module 04.)

### L2/Link — "Get a frame across ONE physical hop"
- **Job:** move a frame between two devices that share a *direct* link (your laptop ↔ your
  router; router ↔ next router). Local delivery only.
- **Answers:** Who's physically next to me on this link (via **MAC address**)? Did this
  frame arrive intact (**checksum**)? Whose turn is it to transmit (media access)?
- **Key idea:** L2 is *local*; it has no concept of "the internet." It just hands off to
  the next hop. Every hop across the internet re-does L2 with new MAC addresses while the
  IP addresses stay the same. (Modules 03, 08, and — for radio — 10/11.)

<figure class="anim-fig">
<svg viewBox="0 0 760 240" role="img" aria-label="Animation: a packet crosses several routers. Its MAC address is rewritten at every hop, but its destination IP stays the same the whole way.">
<style>
.h1-node{fill:#eef5ff;stroke:#2c7be5;stroke-width:2}
.h1-nl{font-size:12px;font-weight:700;fill:#1f4a7a}
.h1-ip{font-size:14px;font-weight:700;fill:#16a34a}
.h1-mac{font-size:14px;font-weight:700;fill:#f59e0b}
.h1-cap{font-size:11px;fill:#8595a7}
.h1-pkt{animation:h1pkt 6s linear infinite}
.h1-m1{animation:h1m1 6s linear infinite}
.h1-m2{animation:h1m2 6s linear infinite}
.h1-m3{animation:h1m3 6s linear infinite}
.h1-ipp{animation:h1ipp 3s ease-in-out infinite}
@keyframes h1pkt{0%{transform:translateX(0)}100%{transform:translateX(620px)}}
@keyframes h1m1{0%,2%{opacity:1}33%{opacity:1}35%,100%{opacity:0}}
@keyframes h1m2{0%,33%{opacity:0}35%,66%{opacity:1}68%,100%{opacity:0}}
@keyframes h1m3{0%,66%{opacity:0}68%{opacity:1}100%{opacity:1}}
@keyframes h1ipp{0%,100%{opacity:.75}50%{opacity:1}}
</style>
<text x="12" y="20" style="font-size:13px;font-weight:700;fill:#2c7be5">One packet, four hops — MAC changes every hop, IP stays end-to-end</text>
<!-- constant IP label -->
<text class="h1-ip h1-ipp" x="380" y="46" text-anchor="middle">L3 destination IP: 142.250.190.78  — NEVER changes ✓</text>
<!-- changing MAC label (3 overlapping, one visible per segment) -->
<text class="h1-mac h1-m1" x="380" y="70" text-anchor="middle">L2 dst MAC: You → Router-1</text>
<text class="h1-mac h1-m2" x="380" y="70" text-anchor="middle">L2 dst MAC: Router-1 → Router-2</text>
<text class="h1-mac h1-m3" x="380" y="70" text-anchor="middle">L2 dst MAC: Router-2 → Server</text>
<!-- link line -->
<line x1="70" y1="150" x2="690" y2="150" stroke="#cbd5e1" stroke-width="3"/>
<!-- nodes -->
<g><rect class="h1-node" x="34" y="128" width="72" height="44" rx="8"/><text class="h1-nl" x="70" y="155" text-anchor="middle">You</text></g>
<g><rect class="h1-node" x="244" y="128" width="72" height="44" rx="8"/><text class="h1-nl" x="280" y="151" text-anchor="middle">Router</text><text class="h1-nl" x="280" y="165" text-anchor="middle">1</text></g>
<g><rect class="h1-node" x="454" y="128" width="72" height="44" rx="8"/><text class="h1-nl" x="490" y="151" text-anchor="middle">Router</text><text class="h1-nl" x="490" y="165" text-anchor="middle">2</text></g>
<g><rect class="h1-node" x="654" y="128" width="72" height="44" rx="8"/><text class="h1-nl" x="690" y="155" text-anchor="middle">Server</text></g>
<!-- travelling packet -->
<g class="h1-pkt">
<rect x="58" y="138" width="26" height="24" rx="5" fill="#ef4444"/>
<text x="71" y="155" text-anchor="middle" style="font-size:10px;font-weight:700;fill:#fff">pkt</text>
</g>
<text class="h1-cap" x="380" y="212" text-anchor="middle">Think of it like a parcel: the courier (MAC) handing it off changes at every depot, but the address on the box (IP) is fixed.</text>
</svg>
<figcaption>The <b>MAC address</b> (amber) is rewritten at every hop — it only ever names the <i>next</i> device. The <b>destination IP</b> (green) is fixed the whole journey. That's the L2-local / L3-global split, made visible.</figcaption>
</figure>

### L1/Physical — "Turn bits into signals and back"
- **Job:** actually transmit 1s and 0s as voltage (copper), light (fiber), or radio
  (Wi-Fi/cellular).
- **Answers:** How do I represent a bit? How fast? What frequency? How do I stay in sync?
- **Key idea:** This is where **modulation** lives — and where a **modem** ("modulator-
  demodulator") does its work. This is the beginning of the "modem" thread you care
  about. (Module 02, then deeply in 07/10.)

---

## 5. A concrete walk-through: what happens when you load a web page

Let's make it real. You type `example.com` and hit enter. Watch the layers cooperate.
(Each numbered step is a *whole module* later; here's the skeleton.)

```
 1. DNS (App/L7 over UDP/L4): "What's the IP for example.com?" → 93.184.216.34
 2. TCP handshake (L4): your laptop and the server exchange SYN / SYN-ACK / ACK
      → this is 1 round-trip BEFORE any data. (Remember this for latency!)
 3. TLS handshake (L6/L7): negotiate encryption keys (more round-trips).
 4. HTTP request (L7): "GET / HTTP/1.1 Host: example.com"
 5. Each of those messages is encapsulated down (TCP→IP→Ethernet/Wi-Fi→bits),
    travels hop by hop (each hop = fresh L2, same L3 addresses), and is
    decapsulated up on the server.
 6. Server responds; bytes come back up the reverse path.
```

⚡ **Latency note.** Look at steps 1–3: **before a single byte of the page is sent**, you
already paid for a DNS lookup + a TCP handshake + a TLS handshake — potentially **3+
round-trips**. If each round-trip is 50 ms (typical) that's 150 ms of pure "hello"
overhead. On 4G, the *first* packet also has to wake the radio from idle (RRC connection
setup — Module 12), which can add another 50–100 ms. **This is why "latency" is rarely
one number** — it's a sum across every layer, and later modules will let you attribute
every millisecond to a specific layer. That decomposition is the payoff you're building
toward.

---

## 6. Where "the modem" fits in this map

You asked to learn the *network/modem* from scratch. Here's the honest placement so you
have correct expectations:

- A **modem** is fundamentally an **L1 (Physical)** device: it *modulates* digital bits
  onto an analog medium (radio waves, DSL tones, cable RF) and *demodulates* them back.
  That's literally its name: **mo**dulator-**dem**odulator.
- But a modern **cellular modem** (the chip in your phone, a.k.a. the "baseband") is
  *far* more than L1. It implements an entire private stack — **PHY (L1), MAC, RLC, PDCP
  (all L2-ish), and RRC (control)** — to make radio behave like a usable link. That whole
  stack is essentially a hugely sophisticated version of the TCP/IP **Link layer**,
  purpose-built for the brutal physics of radio (interference, mobility, shared spectrum).
- So the journey is: understand the **generic layers first** (Modules 01–06), understand
  **radio physics** (07), then see how cellular **rebuilds the bottom two layers** in an
  elaborate way to survive radio (10–12). Concepts like **paging, RRC states, PDCP,
  page misses** all live in that cellular link-layer machinery.

> **Keep this thread:** every time we learn a generic concept (framing, addressing,
> retransmission, flow control), note it — because cellular re-implements *all* of them
> with radio-specific twists. You'll get the "aha, it's the same idea again" moment
> repeatedly. That's the fast path to hero.

---

## 7. Common misconceptions to kill now

- ❌ *"Data literally jumps from App on my machine to App on the server."* No — it goes
  all the way down to bits and back up. The peer-to-peer feeling is a useful *illusion*
  created by each layer only reading its own header.
- ❌ *"IP guarantees delivery."* No. IP is best-effort. Reliability is TCP's job (L4).
- ❌ *"MAC address / L2 gets my packet across the internet."* No — L2 is one hop only.
  MAC addresses change at every hop; the IP addresses are what stay constant end-to-end.
- ❌ *"OSI is what the internet runs on."* No — the internet runs on TCP/IP (4 layers).
  OSI (7 layers) is the shared *vocabulary*, not the implementation.
- ❌ *"More bandwidth = less latency."* No — different things. Bandwidth is how *wide* the
  pipe is; latency is how *long* the trip takes. A fat pipe doesn't shorten the road.
  (We formalize this in Module 02.)

---

## Check your understanding

Click an answer — you'll get instant feedback and an explanation. (Interactive on the
course site.)

<div class="quiz">
<p class="q">You send the string "hi" over TCP/IP. In what order does it get wrapped as it goes <em>down</em> the stack?</p>
<ul class="options">
<li>Ethernet header, then IP header, then TCP header</li>
<li data-correct="true">TCP header, then IP header, then Ethernet header</li>
<li>IP header, then TCP header, then Ethernet header</li>
</ul>
<div class="explain">Data flows down App → Transport → Network → Link, and each layer
wraps what it receives. So TCP wraps first, then IP wraps that, then Ethernet wraps that.
The receiver unwraps in the exact reverse order.</div>
</div>

<div class="quiz">
<p class="q">Which statement about IP (the Network layer) is true?</p>
<ul class="options">
<li>It guarantees your data arrives in order.</li>
<li>It identifies which <em>program</em> on a machine should get the data.</li>
<li data-correct="true">It's best-effort: it tries to deliver to the right machine but makes no guarantees.</li>
</ul>
<div class="explain">IP is best-effort — no delivery or ordering guarantee; that's TCP's
job (L4). Picking the program is done by <strong>ports</strong> (also L4), not IP.</div>
</div>

<div class="quiz">
<p class="q">As a packet crosses 5 routers between you and a server, what changes at every hop?</p>
<ul class="options">
<li>The source and destination IP addresses.</li>
<li data-correct="true">The L2 (MAC) addresses in the frame — a fresh pair for each hop.</li>
<li>Nothing changes until it reaches the server.</li>
</ul>
<div class="explain">L2 is one-hop-only, so the MAC addresses are rewritten at every hop
to reach the next device. The end-to-end IP addresses stay the same the whole way — that's
exactly the L2-vs-L3 division of labor.</div>
</div>

## Exercises

Do these. Networking becomes real the moment you *see* the layers on your own machine.

1. **See the layers with your own eyes.** Install Wireshark (free). Capture traffic while
   loading a simple site. Find a single packet and expand it — you'll literally see
   `Ethernet → IP → TCP → HTTP` nested exactly like Section 3. Note the header of each
   layer. *(This is your first `🔧 Project` — we'll go deep on Wireshark in Module 03.)*

2. **Trace the hops.** Run `traceroute example.com` (macOS/Linux) or `tracert` (Windows).
   Each line is one **L2 hop** where L3 (IP) stayed aimed at the same destination. Count
   the hops. Notice the latency (ms) climb.

3. **Prove ports route to programs.** Run `curl -v https://example.com` and read the
   verbose output. Identify: the DNS resolution, the TCP connection (to port 443), the
   TLS handshake, then the HTTP request/response. Map each line to a layer.

4. **Explain it back.** In your own words (write it in a note), answer: *Why can the same
   `curl` command work identically over Wi-Fi and 4G?* If your answer mentions "the app
   and transport layers don't change, only the link/physical layers swap," you've got it.

5. **Latency prediction.** Before Module 13, guess: for a page load, roughly how many
   round-trips happen *before the first byte of HTML arrives*? Write your guess down;
   we'll check it.

---

## Cheat-sheet (skim later)

```
LAYERS (OSI# / TCP-IP / unit / job / example)
 7 App    ┐
 6 Present ├ App    │ message  │ meaning of the bytes        │ HTTP, DNS, TLS
 5 Session ┘
 4 Transport│ Transport│ segment │ program-to-program, reliable│ TCP, UDP, QUIC
 3 Network  │ Internet │ packet  │ machine-to-machine, routing │ IP, ICMP
 2 Data Link┐          │ frame   │ one hop, local delivery     │ Ethernet, Wi-Fi, ARP
 1 Physical ┘ Link     │ bits    │ signals on the medium       │ copper, fiber, radio

ENCAPSULATION: App data → +TCP hdr → +IP hdr → +Eth hdr/trl → bits   (down)
               reverse on the way up (decapsulation)

MENTAL RULES
 • Each layer: one job, clean service up, depends only on service below.
 • IP → the machine.  Ports → the program.  MAC → the next hop.
 • IP = best-effort.  TCP = reliability on top.
 • L2 changes every hop; L3 addresses stay end-to-end.
 • Bandwidth ≠ latency.  Headers = overhead.
 • A modem = L1 (modulate/demodulate). A cellular modem = a whole L1+L2 stack for radio.
```

---

**Next up → Module 02: How data physically moves** — bits, signals, the real definitions
of bandwidth/latency/throughput/jitter, and what modulation (and therefore a modem)
actually does. That's where the "modem" thread truly starts.
