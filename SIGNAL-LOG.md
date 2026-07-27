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
| [Q07](#q07--how-does-dns-work-at-scale-securely) | 2026-07-27 | Module 06 | How does DNS work, scale, stay resilient & secure — the hidden parts? |
| [Q08](#q08--certificates-tls-handshake-chaining--sni) | 2026-07-27 | Module 06 | Certificates, root/child chaining, the TLS handshake, SNI — explain in depth |
| [Q09](#q09--add-visualsanimations-to-everything) | 2026-07-27 | Meta | Add visuals / animated GIFs across all discussions so far |
| [Q10](#q10--why-do-we-need-ips-why-cant-names-do-the-job) | 2026-07-27 | Module 04 | Why do we need IPs — why can't names do the job? |

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

### Q07 — How does DNS work at scale, securely?
**Asked:** 2026-07-27 · **Topic:** Module 06 (DNS) — full deep-dive

**Question**
> How does DNS works? How is it able to handle these much request? These much url's? What I
> believe is that DNS is not a single step thing? It must be some component divide thing which
> helps for all this? How does it resolves and maps everything? is the map is wiped out does
> everything goes null? how do this map is secured? what's the hidden things behind the scenes?

**Explanation**
Full write-up: **[🔎 Deep dive: How DNS works](deep-dive-dns.md)**. Answers to each part:

- **Not a single step — correct.** DNS is a **distributed, hierarchical, cached** database.
  Three superpowers: **hierarchy** (namespace tree root → TLD → domain → host, read right to
  left), **delegation** (each level only points to the next; nobody holds everything), and
  **caching** (most queries never reach the source).
- **Components:** stub resolver (your OS) → recursive resolver (ISP/8.8.8.8, does the legwork
  + caches) → root servers → TLD servers (e.g. Verisign for .com) → authoritative servers
  (the domain owner's, hold the real records). Registrar/registry/ICANN govern how names
  enter the system.
- **How it resolves:** recursive query to the resolver, which does *iterative* queries root →
  TLD → authoritative, using **glue records** to avoid chicken-and-egg, then caches by **TTL**.
  Records are typed: A/AAAA/CNAME/MX/NS/SOA/TXT/PTR/SRV/CAA.
- **How it scales:** caching (biggest lever, incl. negative/NXDOMAIN caching) + hierarchy +
  **anycast** (one IP = thousands of servers, nearest wins; root = 13 identities × thousands
  of instances) + redundancy (≥2 authoritative per zone) + tiny UDP/53 packets.
- **"Map wiped → null?" No.** There's no central map. Caches survive outages until TTL;
  redundant servers cover failures; a dead domain fails **only per-domain, only after TTL**
  (e.g. Dyn 2016, Facebook 2021) — never global-instant.
- **Security = 3 distinct guarantees:** **DNSSEC** = authenticity/integrity (signatures, chain
  of trust from root — *not* encrypted); **DoH/DoT** = privacy (encrypt query to resolver);
  **registry lock + 2FA** = anti-hijack. Plus query-ID/port randomization vs Kaminsky cache
  poisoning.
- **Hidden gems:** TTL tuning tradeoffs, anycast, and especially **GeoDNS / latency-based
  routing** — authoritative servers return *different IPs by location*, which is how **CDNs
  and global load balancing** actually work. Also EDNS Client Subnet, CNAME chains, root KSK
  rollover, Happy Eyeballs.

**Key takeaway:** DNS scales and survives because it's decentralized by design — hierarchy
splits the work, delegation removes the central owner, and caching means the source is rarely
asked. Security was bolted on later as two separate things: DNSSEC (is it real?) vs DoH/DoT
(is it private?).

---

### Q08 — Certificates, TLS handshake, chaining & SNI
**Asked:** 2026-07-27 · **Topic:** Module 06 (TLS/HTTPS) — full deep-dive

**Question**
> When we checked on this DNS part, something related to certificate is mentioned. This leads
> to my next deep dive question on this certificates. What are these certificates? The root and
> child certificates? What is this whole process of handshake which involved this certificates?
> I have heard of SNI as well, so what is that? What is this chaining? Explain in depth about
> all these and the other concepts which one should know.

**Explanation**
Full write-up: **[🔐 Deep dive: TLS, Certificates & the Chain of Trust](deep-dive-tls-certificates.md)**.
Core points:

- **Certificates prove identity, not secrecy.** Two separate guarantees: **confidentiality**
  (encryption) vs **authentication** (certificates). Encryption alone is useless if you
  encrypted to an impostor — certs stop MITM by proving you're really talking to google.com.
- **What a cert is:** an **X.509** signed statement — "public key K belongs to google.com" —
  signed by a **CA**. Contents: Subject, Public Key, **SAN** (valid hostnames), Issuer,
  Validity, Serial, CA signature.
- **Root vs child (chaining):** **Leaf** (google.com) is signed by an **Intermediate CA**,
  signed by a **Root CA** (self-signed, pre-installed in your device's **trust store**). Verify
  bottom-up; the server sends leaf + intermediate, you already have the root. Intermediates
  exist so the root key stays **offline** (revoke an intermediate, never the root).
- **The handshake (TLS 1.3, 1-RTT):** ClientHello (ciphers, ephemeral DH key share, SNI, ALPN)
  → ServerHello (cipher + key share) + **Certificate** + **CertificateVerify** (server signs
  the transcript with its private key = proof it holds the key = the real auth moment) +
  Finished → client verifies chain + signature, derives keys → encrypted data. **(EC)DHE
  ephemeral keys give forward secrecy.** 1.2 was 2-RTT with insecure RSA option.
- **SNI:** the hostname placed in the (plaintext) ClientHello so a server hosting many sites
  picks the right cert. Downside: it leaks *which site* you visit → **ECH (Encrypted Client
  Hello)** fixes it using a key published via DNS.
- **Also must-know:** validation = chain + hostname(SAN) + dates + **revocation** (CRL/OCSP/
  **OCSP stapling**) + **Certificate Transparency** (public logs make mis-issuance detectable);
  cert types DV/OV/EV + wildcard/SAN + self-signed; **ACME/Let's Encrypt** (free automated
  issuance); **mTLS** (client also presents a cert); HSTS, pinning, PKI, root-store distrust.

**Key takeaway:** a certificate is a CA vouching that a public key belongs to a domain, trusted
via a chain up to a pre-installed root; the handshake authenticates (CertificateVerify proves
private-key possession) then agrees an ephemeral symmetric key. Certificates = identity;
encryption = secrecy — never conflate them.

---

### Q09 — Add visuals/animations to everything
**Asked:** 2026-07-27 · **Topic:** Meta / pedagogy

**Question**
> In all the discussion we had till now, can we add visuals? some gifs to get the concept in
> depth? In all the discussion we had?

**Explanation**
Added **animated SVG** figures (chosen over literal GIFs — crisp, tiny, editable, and they
animate on the live site; the tradeoff is they don't animate in GitHub's raw `.md` preview,
only on the site). Rolled out **exhaustively, multiple per page**, across all six pages
(18 animations total):

- **Module 01:** encapsulation build-up · virtual peer conversation · MAC-changes-per-hop.
- **Module 02:** ASK/FSK/PSK flowing signals · QPSK vs 16-QAM constellation · transmission
  vs propagation delay · bandwidth-vs-latency highway.
- **Module 03:** switch flooding + MAC learning · ARP broadcast/reply · CSMA/CD collision +
  backoff.
- **google.com deep-dive:** six-phase pipeline · round-trips accumulating before first byte.
- **DNS deep-dive:** recursive resolution walk · cache miss vs hit · anycast nearest-server.
- **TLS deep-dive:** chain-of-trust verification · TLS 1.3 handshake · SNI cert selection.

Infra: `assets/anim.css` (figure chrome + a `prefers-reduced-motion` accessibility guard
that freezes animations), loaded in `index.html`. Each figure is a self-contained inline
`<svg>` with namespaced CSS keyframes; all 18 validated as well-formed XML.

**Key takeaway:** the course is now visually animated end-to-end; contributors can add more
using the same self-contained inline-SVG pattern.

---

### Q10 — Why do we need IPs — why can't names do the job?
**Asked:** 2026-07-27 · **Topic:** Module 04 (Network layer)

**Question**
> Why do we need the IP's? Why can't the name do the job?

**Explanation**
Names and IPs solve **different problems**: a name is an **identifier** (*who/what* — for
humans, stable, memorable); an IP is a **locator** (*where* — for routers, structured by
network topology). You need both, and **DNS bridges them**. Why names can't replace IPs for
routing:

1. **Routing needs hierarchy + aggregation.** IPs are hierarchical (network prefix + host),
   so a router keeps a *small* table — "everything in 142.250.0.0/16 goes this way" — instead
   of knowing where each of billions of hosts is. Names are flat and location-meaningless
   (`google.com` tells a router nothing about direction), so name-routing would need a global
   table of every name with no way to summarize — it wouldn't scale.
2. **Fixed length = hardware speed.** IPs are fixed-size (4 bytes v4 / 16 v6), trivial for
   routers to parse at line rate for billions of packets/sec. Names are variable-length
   strings — slow to match in silicon.
3. **Decoupling = flexibility (the killer reason).** Because name and address are separate,
   you can move a server to a new IP without changing its name, point one name at many IPs
   (CDN/GeoDNS/load balancing), or host many names on one IP (SNI/virtual hosting). Fuse them
   and you lose all of that.
4. **Layering.** Names live at the human/application layer; IPs at the network layer (L3).
   The indirection is deliberate separation of concerns (Module 01).

Analogy: a person's **name** vs their **postal address**. The address is hierarchical
(country→city→street→number) so mail is sortable at each level without any office knowing
where everyone lives; the name gives zero routing hints. You can move house (new address)
yet keep your name — and the phone book (DNS) maps one to the other.

**Key takeaway:** name = *who* (for humans), IP = *where* (for routing); IP's hierarchy makes
internet-scale routing possible, and keeping them separate is what enables CDNs, failover, and
load balancing. DNS is the deliberate bridge between the two.

---

### Q11 — What is static / dynamic / rotating IP?
**Asked:** 2026-07-27 · **Topic:** Module 04 (Network layer)

**Question**
> What is static and dynamic IP? Rotating IP?

**Explanation**
- **Static IP** — a fixed address that doesn't change; manually/reserved-assigned. Used for
  things that must be *found* at a stable location: servers, mail servers, VPN endpoints. Pros:
  reliable to reach, good for hosting/DNS A-records. Cons: costs more, manual admin, easier to
  track/fingerprint, a standing attack target.
- **Dynamic IP** — an address leased temporarily, typically via **DHCP** (Dynamic Host
  Configuration Protocol). Your router/ISP hands one out from a pool with a **lease time**; on
  expiry it renews (often the same one) or you may get a different one. This is what most
  home/phone devices use. Pros: automatic, conserves scarce IPv4 addresses (ISPs reuse a pool
  across many customers who aren't all online forever), cheaper. Cons: address can change, so
  bad for hosting a service (mitigated by **Dynamic DNS** which auto-updates a name→current-IP
  mapping).
- **Rotating IP** — your outbound (public) IP is *deliberately* cycled across a pool over
  time or per request, usually via a proxy service / proxy pool (datacenter, residential, or
  mobile IPs). Purpose: distribute requests across many source IPs — legitimately for
  privacy, geo-testing, resilient scraping, ad verification; abusively for evading rate limits
  and bans. Related but distinct from **NAT** (many devices already *share* one public IP —
  Module 04) and from a **VPN** (which replaces your public IP with the server's; some VPN/
  proxy products rotate it — Module 15).

Underlying detail: how you get an address at all is usually **DHCP** (dynamic) or manual
config (static); NAT means your **private** LAN IP and your **public** IP are different things
(covered next in Module 04).

**Key takeaway:** static = fixed & findable (servers); dynamic = leased via DHCP & may change
(most clients, saves IPv4); rotating = intentionally cycling your public IP across a pool
(privacy/scale/evasion). All three are about *how an address is assigned/changed*, layered on
top of why IPs exist at all (Q10).

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
