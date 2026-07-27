# 🔎 Deep Dive: How DNS *really* works

> **The one idea to keep:** DNS is a **distributed, hierarchical, cached database** — the
> internet's phone book — engineered so that **no single machine ever holds the whole thing**,
> yet almost any name on Earth resolves to an address in milliseconds. Its three superpowers
> are **hierarchy** (split the work), **delegation** (nobody's in charge of everything), and
> **caching** (answer most queries without asking anyone). Miss those three and DNS looks
> like magic; understand them and it looks inevitable.

This page answers, in depth, exactly what you asked:
- How does DNS work, and how is it *not* a single step?
- How does it handle *this many* requests and domains?
- How does it resolve and map everything?
- If "the map" is wiped, does everything go null?
- How is the map secured?
- What are the hidden things behind the scenes?

📚 This is the full version of DNS Phase 2–3 from the
[google.com deep-dive](deep-dive-loading-google.md). Module 06 will formalize it.

---

## 1. The problem DNS solves (and why one server can't)

Humans want **names** (`google.com`); machines route to **IP addresses** (`142.250.190.78`,
Module 01). So we need a lookup service: name → IP. Simple in principle. Brutal at scale:

- **Hundreds of millions** of registered domains.
- **Trillions** of lookups per day, globally.
- New domains and IP changes happen constantly.
- It must be **fast** (it's the *first* thing before any connection — Module 02 latency).

You cannot put that in one server, or even one data center. A single machine would be a
performance bottleneck, a single point of failure, and a juicy attack target. So DNS is
built as the opposite of "one big map." This is the "component-divided thing" you suspected.

---

## 2. The core trick: a hierarchy of delegated responsibility

The domain namespace is a **tree**, read **right to left**:

```
                         . (root)
                         │
        ┌────────────┬───┴────┬──────────────┐
      com          org       net     ...   uk  (TLDs — Top-Level Domains)
        │                                    │
     google                               co.uk
        │                                    │
   ┌────┴────┐                            bbc
  www      mail                            │
                                          www
   www.google.com.                    www.bbc.co.uk.
```

The magic word is **delegation**: each level hands off responsibility for everything below
it to someone else.

- The **root** doesn't know where `google.com` is. It only knows *"for anything ending in
  `.com`, go ask the `.com` servers."*
- The **`.com` servers** don't know `www.google.com`. They only know *"for `google.com`, go
  ask Google's nameservers."*
- **Google's nameservers** are **authoritative** for `google.com` — they hold the actual
  records.

> **Why this is the whole answer to "how does it scale?"** Responsibility is *partitioned*.
> Google manages its own records; Verisign manages `.com`'s delegations; the root manages the
> list of TLDs. Nobody has to know everything, so the system grows without any central
> bottleneck. Add a billion domains and the root's job doesn't get any bigger — it still just
> points at the ~1,500 TLDs.

---

## 3. The players (the components you intuited)

| Component | Who runs it | Job |
|-----------|-------------|-----|
| **Stub resolver** | Your OS (in your device) | The tiny client that just asks "resolve this for me" |
| **Recursive resolver** | Your ISP, or `8.8.8.8` / `1.1.1.1` | Does all the legwork on your behalf; **caches** heavily |
| **Root name servers** | 12 orgs, 13 "letters" (a–m), thousands of instances | Point to the right TLD servers |
| **TLD name servers** | Registries (e.g. Verisign for `.com`) | Point to the authoritative servers for each domain |
| **Authoritative name servers** | The domain owner (or their DNS provider) | Hold the actual records (A, MX, …) |
| **Registrar / Registry** | e.g. GoDaddy / Verisign; governed by ICANN/IANA | How a name gets *into* the system in the first place |

The critical split: the **recursive resolver** does the hunting and remembers answers; the
**authoritative servers** are the source of truth but are only asked when nobody has a cached
answer.

---

## 4. How a name actually resolves (the multi-step walk)

Here's the "not a single step" process, end to end. Say nothing is cached anywhere:

```mermaid
sequenceDiagram
    participant S as Stub (your OS)
    participant R as Recursive resolver
    participant Root as Root server
    participant TLD as .com TLD server
    participant Auth as google.com authoritative

    S->>R: what's the IP of www.google.com? (recursive)
    R->>Root: who handles .com?
    Root-->>R: ask the .com servers (here are their addresses)
    R->>TLD: who handles google.com?
    TLD-->>R: ask ns1.google.com (+ glue: its IP)
    R->>Auth: what's the A record for www.google.com?
    Auth-->>R: 142.250.190.78 (TTL 300s)
    R-->>S: 142.250.190.78
    Note over R: caches every answer for its TTL
```

<figure class="anim-fig">
<svg viewBox="0 0 720 300" role="img" aria-label="Animation: the resolver walks the DNS hierarchy — asking the root, then the .com TLD, then the authoritative server — then caches and returns the IP.">
<style>
.n1-box{stroke-width:2}
.n1-t{font-size:11.5px;font-weight:700}
.n1-out{stroke:#2c7be5;stroke-width:2;animation-timing-function:linear}
.n1-in{stroke:#16a34a;stroke-width:2}
.n1-q1{animation:n1f 9s linear infinite}
.n1-ro{animation:n1f2 9s linear infinite}
.n1-ri{animation:n1f3 9s linear infinite}
.n1-to{animation:n1f4 9s linear infinite}
.n1-ti{animation:n1f5 9s linear infinite}
.n1-ao{animation:n1f6 9s linear infinite}
.n1-ai{animation:n1f7 9s linear infinite}
.n1-ans{animation:n1f8 9s linear infinite}
@keyframes n1f{0%,3%{opacity:0}6%,100%{opacity:1}}
@keyframes n1f2{0%,14%{opacity:0}17%,100%{opacity:1}}
@keyframes n1f3{0%,21%{opacity:0}24%,100%{opacity:1}}
@keyframes n1f4{0%,30%{opacity:0}33%,100%{opacity:1}}
@keyframes n1f5{0%,37%{opacity:0}40%,100%{opacity:1}}
@keyframes n1f6{0%,46%{opacity:0}49%,100%{opacity:1}}
@keyframes n1f7{0%,53%{opacity:0}56%,100%{opacity:1}}
@keyframes n1f8{0%,63%{opacity:0}66%,100%{opacity:1}}
.n1-c1{animation:n1c1 9s linear infinite}
.n1-c2{animation:n1c2 9s linear infinite}
.n1-c3{animation:n1c3 9s linear infinite}
.n1-c4{animation:n1c4 9s linear infinite}
@keyframes n1c1{0%,15%{opacity:1}18%,100%{opacity:0}}
@keyframes n1c2{0%,17%{opacity:0}20%,37%{opacity:1}40%,100%{opacity:0}}
@keyframes n1c3{0%,39%{opacity:0}42%,60%{opacity:1}63%,100%{opacity:0}}
@keyframes n1c4{0%,62%{opacity:0}66%,100%{opacity:1}}
</style>
<text x="12" y="18" style="font-size:13px;font-weight:700;fill:#2c7be5">The resolver walks the hierarchy — nobody holds the whole map</text>
<!-- nodes -->
<rect class="n1-box" x="30" y="130" width="90" height="46" rx="8" fill="#eef5ff" stroke="#2c7be5"/><text class="n1-t" x="75" y="152" text-anchor="middle" fill="#1f4a7a">You</text><text class="n1-t" x="75" y="167" text-anchor="middle" fill="#8595a7" style="font-size:9px">(stub)</text>
<rect class="n1-box" x="190" y="130" width="110" height="46" rx="8" fill="#dbeafe" stroke="#2c7be5"/><text class="n1-t" x="245" y="152" text-anchor="middle" fill="#1f4a7a">Resolver</text><text class="n1-t" x="245" y="167" text-anchor="middle" fill="#8595a7" style="font-size:9px">caches answers</text>
<rect class="n1-box" x="560" y="35" width="130" height="42" rx="8" fill="#fef9c3" stroke="#f59e0b"/><text class="n1-t" x="625" y="61" text-anchor="middle" fill="#a16207">Root (.)</text>
<rect class="n1-box" x="560" y="132" width="130" height="42" rx="8" fill="#fef9c3" stroke="#f59e0b"/><text class="n1-t" x="625" y="158" text-anchor="middle" fill="#a16207">.com TLD</text>
<rect class="n1-box" x="560" y="229" width="130" height="42" rx="8" fill="#dcfce7" stroke="#16a34a"/><text class="n1-t" x="625" y="250" text-anchor="middle" fill="#166534">Authoritative</text><text class="n1-t" x="625" y="264" text-anchor="middle" fill="#16a34a" style="font-size:9px">google.com</text>
<!-- arrows -->
<line class="n1-q1 n1-out" x1="120" y1="153" x2="188" y2="153"/><polygon class="n1-q1" points="188,149 188,157 196,153" fill="#2c7be5"/>
<line class="n1-ro n1-out" x1="300" y1="146" x2="558" y2="62"/><polygon class="n1-ro" points="558,58 552,68 566,66" fill="#2c7be5"/>
<line class="n1-ri n1-in" x1="558" y1="72" x2="300" y2="152"/><polygon class="n1-ri" points="300,148 306,150 302,160" fill="#16a34a"/>
<line class="n1-to n1-out" x1="300" y1="153" x2="558" y2="153"/><polygon class="n1-to" points="558,149 558,157 566,153" fill="#2c7be5"/>
<line class="n1-ti n1-in" x1="558" y1="160" x2="302" y2="160"/><polygon class="n1-ti" points="302,156 302,164 294,160" fill="#16a34a"/>
<line class="n1-ao n1-out" x1="300" y1="160" x2="558" y2="248"/><polygon class="n1-ao" points="558,244 552,252 566,254" fill="#2c7be5"/>
<line class="n1-ai n1-in" x1="558" y1="256" x2="300" y2="164"/><polygon class="n1-ai" points="300,160 306,170 292,168" fill="#16a34a"/>
<line class="n1-ans n1-in" x1="188" y1="163" x2="122" y2="163"/><polygon class="n1-ans" points="122,159 122,167 114,163" fill="#16a34a"/>
<!-- step captions -->
<text class="n1-c1" x="360" y="292" text-anchor="middle" style="font-size:11.5px;font-weight:700;fill:#2c7be5">You ask the resolver: "what's the IP of www.google.com?"</text>
<text class="n1-c2" x="360" y="292" text-anchor="middle" style="font-size:11.5px;font-weight:700;fill:#a16207">Resolver → Root: "who handles .com?"  →  "ask the .com servers"</text>
<text class="n1-c3" x="360" y="292" text-anchor="middle" style="font-size:11.5px;font-weight:700;fill:#a16207">Resolver → .com: "who handles google.com?"  →  "ask ns1.google (+glue)"</text>
<text class="n1-c4" x="360" y="292" text-anchor="middle" style="font-size:11.5px;font-weight:700;fill:#166534">Resolver → Authoritative → 142.250.190.78 → cached (TTL) → back to you ✓</text>
</svg>
<figcaption>Each server only knows the <b>next</b> step down — the root points to <b>.com</b>, which points to Google's servers, which hold the answer. The resolver stitches it together and <b>caches</b> every step (that's why the next lookup is instant).</figcaption>
</figure>

Two modes of asking, and the distinction matters:
- **Recursive query** (stub → resolver): *"Give me the final answer; do whatever it takes."*
- **Iterative queries** (resolver → root/TLD/auth): each server replies *"I don't have it,
  but here's who to ask next."* The resolver walks the chain itself.

**Glue records** solve a chicken-and-egg problem: the `.com` server says "ask
`ns1.google.com`" — but to ask it you need *its* IP, which is itself under `google.com`. So
the TLD server also ships the IP of `ns1.google.com` directly ("glue"), breaking the loop.

The first time, this takes several round-trips. **Every subsequent time, caching collapses it
to ~zero** (Section 6).

---

## 5. What's actually stored: the "map" is many record types

A domain's authoritative data (its **zone**) isn't just name→IP. It's a set of typed
records:

| Record | Maps / means |
|--------|--------------|
| **A** | name → IPv4 address |
| **AAAA** | name → IPv6 address |
| **CNAME** | name → *another name* (an alias; "look this up instead") |
| **MX** | name → mail servers (with priorities) |
| **NS** | which nameservers are authoritative for this zone |
| **SOA** | "Start of Authority" — zone metadata: primary NS, serial, timers, **negative-cache TTL** |
| **TXT** | arbitrary text (used for SPF/DKIM email auth, domain verification) |
| **PTR** | IP → name (reverse DNS) |
| **SRV** | service location (host+port for a service) |
| **CAA** | which Certificate Authorities may issue certs for this domain |

So "the map" is really millions of small **zone files**, each owned and served by whoever
runs that domain — not one global table.

---

## 6. How it handles *this many* requests — the real mechanisms

You asked the killer question. Here's how DNS absorbs planetary load:

### a) Caching — by far the biggest lever
Every answer carries a **TTL** (time-to-live, in seconds). Anyone who learns it may reuse it
until the TTL expires, at *multiple* layers:
- **Browser cache** → **OS stub cache** → **recursive resolver cache**.
- Result: the *overwhelming majority* of lookups are answered from cache without ever
  touching root/TLD/authoritative servers. The root servers see a tiny fraction of the
  world's queries precisely because `.com`'s location is cached almost everywhere, almost
  always.
- **Negative caching too:** "this name doesn't exist" (**NXDOMAIN**) is cached (per the SOA's
  timer), so typos and dead names don't hammer the servers repeatedly.

<figure class="anim-fig">
<svg viewBox="0 0 720 210" role="img" aria-label="Animation: a cold cache miss requires many hops through the hierarchy; a warm cache hit answers instantly.">
<style>
.n2-node{stroke-width:1.5}
.n2-t{font-size:10.5px;font-weight:700;fill:#1f4a7a}
.n2-h{font-size:12px;font-weight:700}
.n2-cold{animation:n2cold 6s linear infinite}
.n2-warm{animation:n2warm 6s linear infinite}
.n2-lc{animation:n2lc 6s linear infinite}
.n2-lw{animation:n2lw 6s linear infinite}
@keyframes n2cold{0%{transform:translateX(0)}8%{transform:translateX(130px)}20%{transform:translateX(270px)}28%{transform:translateX(130px)}42%{transform:translateX(400px)}50%{transform:translateX(130px)}66%{transform:translateX(530px)}74%{transform:translateX(130px)}88%,100%{transform:translateX(0)}}
@keyframes n2warm{0%{transform:translateX(0)}10%{transform:translateX(130px)}22%{transform:translateX(130px)}32%,100%{transform:translateX(0)}}
@keyframes n2lc{0%,84%{opacity:0}88%,100%{opacity:1}}
@keyframes n2lw{0%,30%{opacity:0}34%,100%{opacity:1}}
</style>
<text x="12" y="16" class="n2-h" fill="#ef4444">Cold — cache MISS: walk the whole hierarchy (several round-trips)</text>
<line x1="72" y1="62" x2="608" y2="62" stroke="#e2e8f0" stroke-width="2"/>
<rect class="n2-node" x="42" y="48" width="58" height="30" rx="6" fill="#eef5ff" stroke="#2c7be5"/><text class="n2-t" x="71" y="67" text-anchor="middle">You</text>
<rect class="n2-node" x="172" y="48" width="66" height="30" rx="6" fill="#dbeafe" stroke="#2c7be5"/><text class="n2-t" x="205" y="67" text-anchor="middle">Resolver</text>
<rect class="n2-node" x="312" y="48" width="56" height="30" rx="6" fill="#fef9c3" stroke="#f59e0b"/><text class="n2-t" x="340" y="67" text-anchor="middle">Root</text>
<rect class="n2-node" x="442" y="48" width="56" height="30" rx="6" fill="#fef9c3" stroke="#f59e0b"/><text class="n2-t" x="470" y="67" text-anchor="middle">.com</text>
<rect class="n2-node" x="572" y="48" width="66" height="30" rx="6" fill="#dcfce7" stroke="#16a34a"/><text class="n2-t" x="605" y="67" text-anchor="middle">Auth</text>
<circle class="n2-cold" cx="71" cy="62" r="7" fill="#ef4444"/>
<text class="n2-lc" x="360" y="98" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#ef4444">slow — many hops ✗</text>
<text x="12" y="132" class="n2-h" fill="#16a34a">Warm — cache HIT: resolver already knows it (instant)</text>
<line x1="72" y1="170" x2="240" y2="170" stroke="#e2e8f0" stroke-width="2"/>
<rect class="n2-node" x="42" y="156" width="58" height="30" rx="6" fill="#eef5ff" stroke="#2c7be5"/><text class="n2-t" x="71" y="175" text-anchor="middle">You</text>
<rect class="n2-node" x="172" y="156" width="66" height="30" rx="6" fill="#dcfce7" stroke="#16a34a"/><text class="n2-t" x="205" y="171" text-anchor="middle">Resolver</text><text class="n2-t" x="205" y="182" text-anchor="middle" style="font-size:8px;fill:#16a34a">✓ cached</text>
<circle class="n2-warm" cx="71" cy="170" r="7" fill="#16a34a"/>
<text class="n2-lw" x="360" y="176" text-anchor="middle" style="font-size:11px;font-weight:700;fill:#16a34a">instant ✓ — never touches root/TLD/auth</text>
</svg>
<figcaption>The <b>first</b> lookup is a full hierarchy walk; every one after (until the TTL expires) is a <b>cache hit</b> answered in one hop. This is why caching, not raw server power, is what lets DNS serve the whole internet.</figcaption>
</figure>

### b) Hierarchy + delegation — distributes the *work itself* (Section 2)
No server is on the path for more than its slice.

### c) Anycast — one IP, thousands of servers
The same IP address is **announced from many locations worldwide** (via BGP routing, Module
04). The network delivers your query to the *topologically nearest* instance. So `8.8.8.8`
isn't one machine — it's thousands, all over the planet, sharing an address. Same for the
root servers: 13 *identities* (a–m) but **well over a thousand physical instances** via
anycast.

<figure class="anim-fig">
<svg viewBox="0 0 720 230" role="img" aria-label="Animation: anycast. Three users in different regions all query the same IP 8.8.8.8, and each is routed to the nearest server instance.">
<style>
.k1-u{fill:#eef5ff;stroke:#2c7be5;stroke-width:2}
.k1-s{fill:#dcfce7;stroke:#16a34a;stroke-width:2}
.k1-t{font-size:11px;font-weight:700;fill:#1f4a7a}
.k1-ip{font-size:10px;font-weight:700;fill:#166534}
.k1-d1{animation:k1d 5s linear infinite}
.k1-d2{animation:k1d 5s linear infinite;animation-delay:.5s}
.k1-d3{animation:k1d 5s linear infinite;animation-delay:1s}
@keyframes k1d{0%{opacity:0;transform:translateX(0)}8%{opacity:1}70%{opacity:1;transform:translateX(430px)}80%,100%{opacity:0;transform:translateX(430px)}}
</style>
<text x="12" y="18" style="font-size:13px;font-weight:700;fill:#2c7be5">Anycast: one IP (8.8.8.8), many servers — routing picks the nearest</text>
<!-- users -->
<rect class="k1-u" x="30" y="40" width="110" height="38" rx="8"/><text class="k1-t" x="85" y="58" text-anchor="middle">User · New York</text><text class="k1-t" x="85" y="72" text-anchor="middle" style="font-size:8.5px;fill:#8595a7">asks 8.8.8.8</text>
<rect class="k1-u" x="30" y="96" width="110" height="38" rx="8"/><text class="k1-t" x="85" y="114" text-anchor="middle">User · London</text><text class="k1-t" x="85" y="128" text-anchor="middle" style="font-size:8.5px;fill:#8595a7">asks 8.8.8.8</text>
<rect class="k1-u" x="30" y="152" width="110" height="38" rx="8"/><text class="k1-t" x="85" y="170" text-anchor="middle">User · Tokyo</text><text class="k1-t" x="85" y="184" text-anchor="middle" style="font-size:8.5px;fill:#8595a7">asks 8.8.8.8</text>
<!-- servers -->
<rect class="k1-s" x="580" y="40" width="120" height="38" rx="8"/><text class="k1-ip" x="640" y="58" text-anchor="middle">8.8.8.8</text><text class="k1-ip" x="640" y="72" text-anchor="middle" style="font-size:8.5px">NYC instance</text>
<rect class="k1-s" x="580" y="96" width="120" height="38" rx="8"/><text class="k1-ip" x="640" y="114" text-anchor="middle">8.8.8.8</text><text class="k1-ip" x="640" y="128" text-anchor="middle" style="font-size:8.5px">London instance</text>
<rect class="k1-s" x="580" y="152" width="120" height="38" rx="8"/><text class="k1-ip" x="640" y="170" text-anchor="middle">8.8.8.8</text><text class="k1-ip" x="640" y="184" text-anchor="middle" style="font-size:8.5px">Tokyo instance</text>
<!-- nearest-hop lines -->
<line x1="140" y1="59" x2="580" y2="59" stroke="#cbd5e1" stroke-width="2"/>
<line x1="140" y1="115" x2="580" y2="115" stroke="#cbd5e1" stroke-width="2"/>
<line x1="140" y1="171" x2="580" y2="171" stroke="#cbd5e1" stroke-width="2"/>
<circle class="k1-d1" cx="150" cy="59" r="7" fill="#16a34a"/>
<circle class="k1-d2" cx="150" cy="115" r="7" fill="#16a34a"/>
<circle class="k1-d3" cx="150" cy="171" r="7" fill="#16a34a"/>
<text x="360" y="216" text-anchor="middle" style="font-size:11px;fill:#8595a7">Same address everywhere — nobody is routed across the planet. This is also how CDNs put content near you.</text>
</svg>
<figcaption>All three users type the <b>same IP</b>, yet each reaches a <b>different, nearby</b> server — the network's routing delivers to the closest instance. It's how <code>8.8.8.8</code>, the root servers, and CDNs all scale and stay fast.</figcaption>
</figure>

### d) Massive redundancy
Every zone must have **at least two** authoritative nameservers (usually more, in different
locations/networks). Big providers run huge fleets.

### e) Lightweight protocol
Queries are tiny **UDP** packets (port 53) — no connection setup, stateless, cheap to serve
at enormous rates.

> **Net effect:** caching answers most queries locally; hierarchy keeps any one server's job
> small; anycast + redundancy spread the rest across thousands of machines. That combination
> is how a "single lookup service" serves the entire internet.

---

## 7. "If the map is wiped, does everything go null?"

Brilliant question — and the answer reveals the whole resilience design. **No, not
instantly, and not globally — because there is no single map to wipe.**

- **There's no central copy.** The data lives in millions of independently-operated zones.
  You'd have to wipe them all — there's no one place to attack.
- **Caches keep things alive.** If an authoritative server goes down, cached answers
  everywhere keep resolving that domain **until their TTLs expire** (seconds to days). Short
  outages are invisible to most users.
- **Redundancy per zone.** Multiple authoritative servers mean one dying doesn't break the
  domain. They stay in sync via **zone transfers** (AXFR/IXFR) from a primary to secondaries.
- **The root is extraordinarily hardened.** 13 identities × anycast = thousands of instances
  across the globe. Attacks on the root have happened and barely registered.
- **What *does* break:** if a specific domain's authoritative servers *all* go down **and**
  its cache entries expire, *that domain* becomes unresolvable — but only that domain, and
  only after TTL. This is what happened in outages like **Dyn (2016)** and **Facebook (2021)**:
  not "DNS died," but "a big provider's authoritative servers became unreachable, so the names
  they served stopped resolving once caches lapsed." DNS as a *system* kept running fine.

> **Takeaway:** DNS degrades **locally and gradually** (per-domain, on TTL expiry), never
> "everything goes null at once." Decentralization + caching + redundancy is exactly what
> makes wiping it impossible.

---

## 7½. Where DNS sits on the CAP theorem (consistency model)

A natural systems question: **CAP** says a distributed data store, *when a network partition
happens*, must choose between **C**onsistency (everyone sees the latest value) and
**A**vailability (every request still gets an answer). So which is DNS?

**DNS is firmly AP — it chooses Availability, and is *eventually consistent*, not strongly
consistent.** That surprises people who assume "it must always be right," so here's the honest
picture:

- **Why not strongly consistent:** the *entire design* is caching with **TTLs**. When you
  change a record, resolvers worldwide keep serving the **old** value until their cached TTL
  expires — seconds to days. During that window, different users legitimately get **different
  answers**. That's the opposite of strong consistency, on purpose.
- **Why AP:** DNS would rather **always answer (fast, from cache or any reachable server)**
  than block to guarantee the newest value. Redundant authoritative servers sync
  **asynchronously** (zone transfers); anycast serves from many instances; during a partition
  resolvers keep answering from cache. Availability + low latency win.
- **It's still "right" — eventually.** DNS isn't *inconsistent*; it's **eventually
  consistent**: once TTLs lapse and secondaries sync, everyone converges to the correct value.
  The knob you control is **TTL** — lower it (e.g. 60 s) before a planned migration so changes
  propagate quickly, raise it afterward to cut load. (This is why "DNS changes take time to
  propagate.")
- **CAP is a simplification — PACELC says more.** Even with **no** partition (the "**E**lse"),
  you still trade **L**atency vs **C**onsistency. DNS clearly picks **latency** (via caching)
  in normal operation too. So in PACELC terms DNS is **PA/EL**: available under partition,
  low-latency otherwise — consistency traded away in both cases.
- **Scope matters:** a single authoritative server's own zone data *is* internally consistent;
  it's the **global system** (caches + secondaries + resolvers) that is eventually consistent.

> **Why this is the right trade for DNS.** A DNS answer that's a few minutes stale is almost
> always harmless; DNS being **down** is catastrophic (nothing resolves). For a read-heavy,
> write-rare, planet-scale lookup system, **availability + speed beat instant consistency** —
> which is exactly why you *don't* rely on fast DNS updates for failover (use anycast or a
> load balancer at a lower layer, and keep the IP stable).

---

## 8. How is the map secured?

DNS was designed in a trusting era, so security was bolted on later. There are **two
different problems** people constantly conflate — keep them separate:

### Problem A: "Is this answer authentic?" → **DNSSEC**
Classic attack: **cache poisoning** (the **Kaminsky attack**, 2008) — trick a resolver into
caching a forged answer, sending users to an attacker's IP.

- **First-line defenses:** randomize the 16-bit **query ID** *and* the source port, so an
  attacker can't easily guess and forge a matching reply.
- **The real fix — DNSSEC (DNS Security Extensions):** authoritative servers
  **cryptographically sign** their records (`RRSIG`), publish public keys (`DNSKEY`), and each
  parent zone signs a hash of its child's key (`DS` record). This builds a **chain of trust
  from the root down** — resolvers can verify an answer genuinely came from the real zone owner
  and wasn't tampered with.
- **Important:** DNSSEC provides **authenticity + integrity, NOT confidentiality.** It proves
  the answer is real; it does **not** hide it. And it's still only partially deployed.

### Problem B: "Can others *see* my lookups?" → **encrypted transport**
Plain DNS is unencrypted, so your ISP (or anyone on the path) can read every domain you look
up. Fixes:
- **DoT (DNS over TLS)** — DNS inside a TLS tunnel, port 853.
- **DoH (DNS over HTTPS)** — DNS inside HTTPS, port 443 (indistinguishable from web traffic).
- These give **privacy** between you and your resolver. (They don't verify the *data's*
  authenticity — that's DNSSEC's job. You often want both.)

### Problem C: taking the domain itself
- **Domain hijacking** — stealing control at the **registrar** (via phished credentials).
  Defenses: **registrar/registry locks**, 2FA on the account. This is an account-security
  problem, not a protocol one.
- **DDoS** on nameservers — absorbed via anycast, over-provisioning, and **Response Rate
  Limiting**.

> **One-line memory:** **DNSSEC = "is it real?"** (signatures). **DoH/DoT = "is it private?"**
> (encryption). **Registry lock = "is it still mine?"** (account security). Three different
> guarantees.

---

## 9. The hidden things behind the scenes

The stuff that makes DNS quietly powerful and that most people never see:

- **TTL & caching layers** — the unsung hero (Section 6). Tuning TTL is a real ops tradeoff:
  low TTL = fast change propagation but more load; high TTL = less load but slow to update.
- **Anycast** — "one IP, everywhere" (Section 6c). Foundational and invisible.
- **GeoDNS / latency-based routing** — *this is the big one.* Authoritative servers can return
  **different answers to different users** based on where the query comes from. Ask for
  `google.com` in India vs the US and you get **different IPs** — the nearest data center.
  **This is how CDNs and global load balancing work**: the "map" is dynamic and
  location-aware, not a fixed lookup. (Helped by **EDNS Client Subnet**, which passes a hint
  about the client's network to the authoritative server.)
- **CNAME chains** — big sites point their name at a CDN's name (`example.com` → CNAME →
  `example.cdn.com`), so the CDN controls the final IP. Lots of real-world DNS is chasing
  these aliases.
- **EDNS(0)** — an extension mechanism that lets DNS carry bigger messages and new features
  (like DNSSEC and Client Subnet) over the original tiny protocol.
- **Root KSK rollover** — the root's master signing key is periodically, very carefully
  rotated globally (a genuinely high-stakes internet-governance event).
- **Registrar → Registry → ICANN/IANA** — the governance chain that makes names unique and
  delegable in the first place; **WHOIS/RDAP** exposes registration data.
- **Browser prefetching & "Happy Eyeballs"** — browsers pre-resolve links you might click,
  and race IPv4 vs IPv6 (AAAA vs A) to use whichever connects first.

---

## The latency angle (ties to your motivation)

- A **cold** resolution can cost several round-trips (root → TLD → auth). On a distant path
  that's real milliseconds *before your connection even starts* (Module 02's propagation
  delay applies to each DNS hop too).
- **Caching + anycast + nearby resolvers** exist largely to crush that first-connection
  latency. Choosing a fast resolver (`1.1.1.1`, `8.8.8.8`) and DNS prefetching are concrete
  latency wins.
- On **mobile**, a cold DNS lookup can also be preceded by RRC radio wake-up (Module 12) —
  stacking delays. This is why aggressive DNS caching matters even more on cellular.

---

## Check your understanding

<div class="quiz">
<p class="q">Why do the root DNS servers <em>not</em> get overwhelmed despite the internet's scale?</p>
<ul class="options">
<li>They are the most powerful supercomputers on Earth.</li>
<li data-correct="true">Caching + hierarchy mean most queries never reach them, and anycast spreads the rest across thousands of instances.</li>
<li>They only run at night.</li>
</ul>
<div class="explain">The root only needs to point at ~1,500 TLDs, and that information is
cached almost everywhere, so the vast majority of lookups never touch the root. What remains
is spread across 13 identities × thousands of anycast instances worldwide.</div>
</div>

<div class="quiz">
<p class="q">An authoritative server for example.com goes completely offline. What happens?</p>
<ul class="options">
<li>example.com instantly becomes unreachable for everyone worldwide.</li>
<li data-correct="true">It keeps resolving from caches until TTLs expire (and from any redundant authoritative servers); only then does it fail — and only for that domain.</li>
<li>The entire .com TLD goes down.</li>
</ul>
<div class="explain">There's no single map to wipe. Cached answers keep working until their
TTL lapses, redundant authoritative servers cover for the dead one, and the failure is scoped
to that one domain — never "everything goes null." This is the caching+redundancy resilience
design.</div>
</div>

<div class="quiz">
<p class="q">What's the difference between DNSSEC and DNS-over-HTTPS (DoH)?</p>
<ul class="options">
<li>They're two names for the same thing.</li>
<li data-correct="true">DNSSEC cryptographically proves an answer is authentic (integrity); DoH encrypts the query for privacy. Different guarantees — you may want both.</li>
<li>DNSSEC encrypts queries; DoH signs records.</li>
</ul>
<div class="explain">DNSSEC = "is this answer real and untampered?" (signatures, chain of trust
from the root) — but it's <em>not</em> encrypted. DoH/DoT = "can eavesdroppers see my
lookups?" (encryption between you and the resolver) — but it doesn't validate the data.
They solve orthogonal problems.</div>
</div>

---

## Exercises

1. **Watch the hierarchy walk.** Run `dig +trace www.google.com`. You'll see the resolver go
   root → `.com` → Google's nameservers, step by step — Section 4 live in your terminal.

2. **See caching & TTL.** Run `dig google.com` twice. Note the **TTL** field counting down on
   the second call (served from cache). Try different record types: `dig google.com MX`,
   `dig google.com AAAA`, `dig google.com NS`.

3. **See GeoDNS in action.** Resolve a big CDN-hosted site and note the IP; compare with a
   public resolver in another region (e.g. `dig @8.8.8.8` vs a regional resolver) — you may
   get different IPs. That's location-aware DNS steering you to the nearest edge.

4. **Check DNSSEC.** Run `dig +dnssec cloudflare.com` and look for `RRSIG` records — signed
   answers. Compare a domain that isn't signed.

5. **Inspect the chain of aliases.** Run `dig www.github.com` and follow any `CNAME` records
   to see how the name delegates to a hosting/CDN provider.

6. **Explain it back.** In a note: *"Why is DNS able to serve the whole internet without a
   central server, and why doesn't wiping one server break it?"* If you hit hierarchy,
   delegation, caching, and redundancy, you've mastered this page.

---

## Cheat-sheet

```
DNS = distributed, hierarchical, cached name→IP database (the internet's phone book)
  3 superpowers: HIERARCHY (split work) · DELEGATION (nobody owns all) · CACHING (skip the ask)

HIERARCHY (read right→left):  root(.) → TLD(.com) → domain(google.com) → host(www)
  each level DELEGATES the level below (root knows TLDs; TLD knows domains; auth knows records)

PLAYERS:
  stub (your OS) → recursive resolver (does legwork, CACHES) → root → TLD → authoritative
  recursive query = "get me the answer"; iterative = "here's who to ask next"
  glue record = ships the nameserver's IP to break the chicken/egg loop

RECORDS: A(v4) AAAA(v6) CNAME(alias) MX(mail) NS(nameservers) SOA(zone meta) TXT PTR SRV CAA

SCALE (how it handles the load):
  CACHING (TTL, multi-layer, + negative/NXDOMAIN)  ← biggest lever
  HIERARCHY/DELEGATION (small job per server)
  ANYCAST (one IP = thousands of servers; picks nearest)
  REDUNDANCY (≥2 authoritative per zone; zone transfer AXFR/IXFR)
  UDP/53 (tiny, stateless)

RESILIENCE ("map wiped?"):  no central map. caches survive outages till TTL; redundant
  servers cover; failure is PER-DOMAIN after TTL, never global-instant. (Dyn'16, FB'21.)

SECURITY (3 different guarantees):
  DNSSEC   = authenticity/integrity (RRSIG/DNSKEY/DS, chain of trust from root) — NOT encrypted
  DoH/DoT  = privacy (encrypt query to resolver, port 443/853) — NOT authenticity
  registry lock + 2FA = anti-hijack (account security)

HIDDEN GEMS: TTL tuning · anycast · GeoDNS/latency routing (=CDN & load balancing!) ·
  EDNS Client Subnet · CNAME chains · root KSK rollover · registrar/registry/ICANN · Happy Eyeballs
```

---

**Related:** [🌐 hitting google.com](deep-dive-loading-google.md) · Module 04 (routing/anycast
mechanics) · Module 06 (DNS/TLS/HTTP formalized).
