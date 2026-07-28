# Glossary

Running list of every term introduced, with the module it first appears in.
Kept plain-English on purpose.

## Module 01 — The Layered Model

- **Layer** — a component that solves one class of networking problem, offers a clean
  service upward, and depends only on the layer below. (Same idea as an interface in code.)
- **OSI model** — the 7-layer *teaching/vocabulary* model (App, Presentation, Session,
  Transport, Network, Data Link, Physical). Not literally how the internet is built.
- **TCP/IP model** — the 4-layer model the internet actually uses: Application, Transport,
  Internet, Link.
- **Encapsulation** — wrapping data from an upper layer inside a lower layer's header (and
  sometimes trailer), like nesting envelopes, as it moves *down* the stack.
- **Decapsulation** — the reverse: each layer strips its own header on the way *up*.
- **Header** — metadata a layer prepends to the data so its twin on the other side knows
  what to do. Overhead — not your actual payload.
- **Trailer** — metadata appended *after* the data (e.g. Ethernet's checksum).
- **PDU (Protocol Data Unit)** — generic name for "the chunk a layer handles."
- **Payload** — the actual data being carried, as opposed to headers.
- **Segment** — the transport-layer PDU for TCP. (**Datagram** = UDP's.)
- **Packet** — the network-layer (IP) PDU.
- **Frame** — the link-layer PDU (e.g. an Ethernet frame).
- **IP address** — L3 address identifying a *machine* on the internet.
- **Port** — L4 number identifying a *program*/service on a machine (e.g. 443 = HTTPS).
- **MAC address** — L2 hardware address identifying a device on a *single local link*.
- **Best-effort** — delivery with no guarantee of arrival or order (IP's model).
- **Routing** — choosing the next hop to move a packet closer to its destination (L3).
- **Hop** — one link traversal between two directly-connected devices.
- **Round-trip (RTT)** — time for a signal to go to the destination and back; the base
  unit of interactive latency.
- **Modem** — *mo*dulator-*dem*odulator; an L1 device converting bits ↔ analog signals.
- **Baseband / cellular modem** — the chip implementing the whole radio stack (PHY, MAC,
  RLC, PDCP, RRC) in a phone. Far more than plain L1.
- **Modulation** — encoding digital bits onto an analog carrier (voltage/light/radio).
- **Bandwidth** — capacity/width of a link (bits per second it *can* carry).
- **Latency** — time for data to travel from A to B (delay), independent of bandwidth.
- **Throughput** — the rate actually achieved in practice (≤ bandwidth).

## Module 02 — How Data Physically Moves

- **Character encoding** — the rule mapping characters to numbers/bits (ASCII, UTF-8).
  e.g. `A` = 65 = `01000001`.
- **ADC / DAC** — analog-to-digital / digital-to-analog converter; turns real-world signals
  (sound, radio) into numbers and back.
- **Line coding (baseband)** — representing bits directly as voltage levels on a wire
  (NRZ, Manchester, 8b/10b).
- **NRZ** — Non-Return-to-Zero; simplest line code (one level = 1, another = 0). Suffers
  clock drift on long runs of the same bit.
- **Manchester encoding** — self-clocking line code with a transition in every bit slot.
- **Self-clocking / clock recovery** — deriving bit timing from the signal itself so the
  receiver stays in sync.
- **Carrier** — a steady sine wave whose properties are varied to carry data.
- **Modulation (passband)** — encoding bits by varying a carrier's amplitude, frequency,
  or phase. The core function of a modem.
- **ASK / FSK / PSK** — Amplitude / Frequency / Phase Shift Keying; modulate one property.
- **QAM** — Quadrature Amplitude Modulation; varies amplitude *and* phase to pack many bits
  per symbol (16-/64-/256-/1024-QAM).
- **Symbol** — one signaling state on the medium; can represent several bits.
- **Constellation diagram** — plot of all possible symbols by amplitude (radius) and phase
  (angle).
- **Baud rate** — symbols per second. (Bit rate = baud × bits/symbol.)
- **SNR (Signal-to-Noise Ratio)** — how strong the signal is versus background noise; sets
  how rich a modulation can be used.
- **Shannon capacity** — max error-free bits/sec = Bandwidth × log₂(1 + SNR).
- **Adaptive modulation & coding (AMC)** — dynamically choosing the richest modulation the
  current signal quality supports; why speed drops with weak signal.
- **Attenuation** — signal weakening with distance.
- **Crosstalk** — interference leaking between adjacent wires (why pairs are twisted).
- **Multipath / fading** — radio signal arriving via multiple bounced paths, adding or
  cancelling.
- **Total internal reflection** — the effect that keeps light bouncing inside a fiber core.
- **Transmission delay** — time to push bits onto the link = bits / bandwidth.
- **Propagation delay** — time for the signal to travel the distance = distance / speed;
  the latency floor, unaffected by bandwidth.
- **Processing delay** — router/switch time to inspect and forward a packet.
- **Queuing delay** — time a packet waits in a buffer; the main congestion-driven latency.
- **Jitter** — variation in latency between packets.

## Module 03 — The Link Layer

- **Frame** — the link-layer PDU; a bounded, addressed unit of bits.
- **Framing** — marking where each frame begins and ends in the bitstream (preamble, SFD).
- **Preamble / SFD** — sync pattern + Start Frame Delimiter marking a frame's start.
- **LLC / MAC sublayers** — Logical Link Control (interfaces to L3) and Media Access Control
  (hardware addressing + who-talks-when).
- **MAC address** — 48-bit hardware address of a network interface (`aa:bb:cc:dd:ee:ff`);
  flat and local.
- **OUI** — Organizationally Unique Identifier; first 3 bytes of a MAC identifying the vendor.
- **EtherType** — frame field naming the payload's L3 protocol (0x0800 IPv4, 0x0806 ARP).
- **MTU** — Maximum Transmission Unit; largest payload a link carries (1500 bytes on Ethernet).
- **FCS / CRC** — Frame Check Sequence; a checksum that *detects* (not corrects) corruption.
- **Unicast / broadcast / multicast** — to one / all (`ff:ff:ff:ff:ff:ff`) / a group.
- **Collision** — two devices transmitting on a shared medium at once, garbling both.
- **CSMA/CD** — Carrier Sense Multiple Access with Collision Detection; the shared-Ethernet
  access rulebook (listen, detect collisions, random backoff).
- **CSMA/CA** — the collision-*avoidance* variant used on Wi-Fi (Module 08).
- **Backoff** — random wait before retrying after a collision.
- **Collision domain** — set of devices that can collide with each other (one per switch port).
- **Broadcast domain** — set of devices that receive each other's broadcasts (bounded by a
  router or VLAN).
- **Hub** — dumb L1 repeater; floods all bits to all ports (one collision domain).
- **Switch** — smart L2 device; learns MAC→port and forwards frames selectively.
- **MAC address table (CAM table)** — a switch's learned map of MAC → port.
- **Flooding** — a switch sending a frame out all ports when the destination is unknown/broadcast.
- **Full / half duplex** — simultaneous two-way vs one-direction-at-a-time transmission.
- **ARP** — Address Resolution Protocol; resolves an IPv4 address to a MAC on the local link.
- **ARP cache** — stored IP↔MAC mappings (`arp -a` / `ip neigh`).
- **NDP** — Neighbor Discovery Protocol; IPv6's replacement for ARP (over ICMPv6).
- **ARP spoofing / MAC flooding** — L2 attacks exploiting ARP's lack of authentication.
- **VLAN / 802.1Q** — virtual LANs segmenting one switch into isolated broadcast domains via
  a frame tag.
- **STP** — Spanning Tree Protocol; disables redundant links to prevent L2 loops/broadcast storms.
- **RNTI** — Radio Network Temporary Identifier; the cellular analog of a MAC address (temporary,
  tower-assigned).

## DNS (deep-dive; formalized in Module 06)

- **DNS** — Domain Name System; the distributed, hierarchical, cached database mapping names
  to IPs (and other records).
- **Stub resolver** — the minimal DNS client in your OS that asks a recursive resolver.
- **Recursive resolver** — server (ISP / 8.8.8.8 / 1.1.1.1) that does the full lookup on your
  behalf and caches results.
- **Authoritative name server** — the source of truth for a domain's records.
- **Root servers** — top of the hierarchy; point to TLD servers. 13 identities (a–m), thousands
  of anycast instances.
- **TLD** — Top-Level Domain (`.com`, `.org`, `.uk`); its servers point to domains' authoritative
  servers.
- **Delegation** — each level of the DNS tree handing responsibility for the level below to
  someone else.
- **Recursive vs iterative query** — "get me the answer" vs "tell me who to ask next."
- **Glue record** — a nameserver's IP shipped alongside its name to break the chicken-and-egg
  lookup loop.
- **Zone** — the portion of the namespace an authoritative server manages (its records).
- **TTL** — Time-To-Live; how long a DNS answer may be cached.
- **Record types** — A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (nameservers), SOA
  (zone metadata), TXT, PTR (reverse), SRV, CAA.
- **NXDOMAIN** — "name does not exist"; negatively cached to reduce load.
- **Anycast** — announcing one IP from many locations so routing delivers to the nearest instance.
- **Zone transfer (AXFR/IXFR)** — syncing zone data from a primary to secondary authoritative
  servers.
- **DNSSEC** — cryptographic signing of DNS records (RRSIG/DNSKEY/DS) for authenticity/integrity;
  chain of trust from the root. Not encryption.
- **DoT / DoH** — DNS over TLS (853) / DNS over HTTPS (443); encrypt queries for privacy.
- **Cache poisoning / Kaminsky attack** — injecting forged answers into a resolver's cache.
- **GeoDNS / latency-based routing** — returning different IPs by client location; the basis of
  CDNs and global load balancing.
- **EDNS(0) / EDNS Client Subnet** — extension mechanism enabling larger messages, DNSSEC, and
  passing a client-location hint to authoritative servers.
- **Registrar / Registry / ICANN / IANA** — the governance chain that makes domain names unique
  and delegable.

## TLS & Certificates (deep-dive; formalized in Module 06)

- **TLS** — Transport Layer Security; encrypts + authenticates connections (the "S" in HTTPS;
  successor to SSL).
- **Confidentiality vs authentication** — encryption (nobody can read it) vs identity proof
  (you're talking to who you think). Certificates provide the latter.
- **Symmetric encryption** — one shared key for encrypt+decrypt (AES, ChaCha20); fast, for bulk data.
- **Asymmetric / public-key crypto** — a public/private key pair; encrypt-to-public,
  sign-with-private. Used for auth + key agreement.
- **Certificate (X.509)** — a CA-signed statement binding a public key to an identity (domain).
- **CA (Certificate Authority)** — a trusted party that signs (vouches for) certificates.
- **SAN (Subject Alternative Name)** — the hostnames a cert is valid for (replaces old Common Name).
- **Chain of trust** — leaf → intermediate → root, each signed by the next; verified up to a
  pre-trusted root.
- **Root CA** — self-signed trust anchor pre-installed in the device trust store; key kept offline.
- **Intermediate CA** — signed by the root; does day-to-day cert signing so the root stays offline.
- **Leaf / end-entity cert** — the server's own certificate (e.g. google.com).
- **Trust store** — the set of root CA certs your OS/browser trusts by default.
- **Handshake** — the TLS negotiation that authenticates and establishes session keys.
- **CertificateVerify** — server signs the handshake transcript with its private key, proving
  it holds the key matching the cert.
- **(EC)DHE** — (Elliptic-Curve) Diffie-Hellman Ephemeral; agrees a shared secret never sent on
  the wire.
- **Forward secrecy** — property (from ephemeral keys) that stealing the server key later can't
  decrypt past sessions.
- **Cipher suite** — the negotiated set of algorithms (e.g. TLS_AES_128_GCM_SHA256).
- **ALPN** — Application-Layer Protocol Negotiation; picks HTTP/2 vs HTTP/1.1 etc. during the handshake.
- **SNI (Server Name Indication)** — hostname in the ClientHello so a multi-site server selects
  the right cert; plaintext (privacy leak).
- **ECH (Encrypted Client Hello)** — encrypts the ClientHello (incl. SNI) using a DNS-published
  key; successor to ESNI.
- **Revocation** — invalidating a cert before expiry: **CRL** (lists), **OCSP** (live query),
  **OCSP stapling** (server attaches a fresh proof, no extra round-trip).
- **Certificate Transparency (CT) / SCT** — public append-only logs of issued certs; SCTs prove
  logging, making mis-issuance detectable.
- **DV / OV / EV** — Domain / Organization / Extended Validation levels (how hard the CA vetted you).
- **ACME / Let's Encrypt** — protocol/CA for free, automated cert issuance & renewal.
- **mTLS (mutual TLS)** — both client and server present certificates.
- **Certificate pinning** — hard-coding which cert/CA an app accepts, to resist rogue CAs.
- **PKI** — Public Key Infrastructure; the whole system of keys, certs, CAs, and policies.

## Module 04 — The Network Layer

- **Network layer (L3)** — moves packets host-to-host across many networks; best-effort.
- **IPv4 address** — a 32-bit integer, written dotted-decimal, split into network + host.
- **Octet** — one 8-bit byte of an IP address (`0–255`).
- **Subnet mask** — 32-bit value marking which address bits are network (1s) vs host (0s).
- **CIDR** (`/N`) — subnet notation; N = number of network bits.
- **Network / broadcast address** — the all-host-bits-0 / all-host-bits-1 addresses of a subnet
  (unusable as host addresses).
- **RFC 1918 / private address** — reusable, non-internet-routable ranges (10/8, 172.16/12,
  192.168/16).
- **TTL (Time To Live, IP)** — IP header hop-counter, decremented each router; 0 = drop.
  (Distinct from DNS caching TTL.)
- **Fragmentation** — splitting an oversized packet to fit a smaller MTU; reassembled at the
  destination.
- **Routing table** — list of destination prefixes → next hop / interface.
- **Default gateway** — the catch-all route (`0.0.0.0/0`) for unknown destinations.
- **Next hop** — the immediate router a packet is handed to.
- **Longest-prefix match** — most-specific route wins.
- **Autonomous System (AS)** — a network under one administrative control, with an AS number.
- **OSPF** — an interior routing protocol (within an AS).
- **BGP** — the exterior routing protocol that glues the internet's ASes together.
- **NAT / PAT** — rewriting private↔public addresses (and ports) at the edge.
- **CGNAT** — carrier-grade NAT; many customers behind shared public IPs.
- **DHCP / DORA** — automatic address leasing (Discover, Offer, Request, Ack).
- **ICMP** — IP's control/error protocol (ping, traceroute, TTL-expired, unreachable).
- **IPv6** — 128-bit addressing; SLAAC, NDP (replaces ARP), no header checksum, generally no NAT.
- **SLAAC** — stateless IPv6 address auto-configuration.
- **GTP** — the tunnel protocol carrying your IP packets across the cellular core.

## Module 05 — The Transport Layer

- **Socket** — the OS handle your program uses to send/receive; bound to an IP+port.
- **4-tuple** — (src IP, src port, dst IP, dst port); uniquely identifies a connection and lets
  the kernel demultiplex packets.
- **Ephemeral port** — short-lived source port (49152–65535) the OS assigns to client connections.
- **UDP** — connectionless best-effort transport: ports + checksum, nothing else (8-byte header).
- **TCP** — reliable, ordered, byte-stream transport built on lossy IP.
- **ISN** — Initial Sequence Number, randomized per connection.
- **SYN / ACK / FIN / RST** — TCP flags: open, acknowledge, graceful close, abrupt reset.
- **Sequence / Acknowledgement number** — byte-offset of data / next byte expected.
- **RTO** — Retransmission Timeout; the timer-based loss detector.
- **Fast retransmit** — resend on 3 duplicate ACKs, without waiting for RTO.
- **SACK** — Selective Acknowledgement; report exact received ranges so only the true gap is resent.
- **rwnd (receive window)** — receiver-advertised free buffer; the flow-control limit.
- **cwnd (congestion window)** — sender's self-imposed network-safety limit.
- **Slow start / congestion avoidance** — exponential then linear cwnd growth phases.
- **AIMD** — Additive Increase, Multiplicative Decrease; the fairness-producing back-off rule.
- **CUBIC / BBR** — modern congestion-control algorithms (loss-based / delay-and-bandwidth-based).
- **Bufferbloat** — excessive latency from oversized buffers hiding loss from TCP.
- **Nagle's algorithm / delayed ACK** — small-write coalescing / ACK batching; can stall
  interactive traffic together.
- **TIME_WAIT** — post-close waiting state (2×MSL) protecting against stray packets and lost
  final ACKs.
- **Head-of-line (HOL) blocking** — one lost segment stalls all data behind it in an ordered stream.
- **QUIC** — modern transport over UDP: independent streams, integrated TLS 1.3, 0-RTT,
  connection migration; the basis of HTTP/3.

## Module 06 — Application Protocols

- **L7 / application layer** — the layer that assigns *meaning* to the bytes for a specific
  application (HTTP, DNS, SMTP, gRPC).
- **HTTP method / status code** — the request verb (GET/POST/PUT/…) and the 3-digit response
  category (2xx OK, 3xx redirect, 4xx client error, 5xx server error).
- **Idempotent** — safe to repeat; N calls have the same effect as one (matters for retries).
- **Persistent connection / keep-alive** — reusing one TCP connection for many requests.
- **Multiplexing** — many independent streams interleaved over one connection (HTTP/2, HTTP/3).
- **HPACK / QPACK** — header compression for HTTP/2 / HTTP/3 (a shared table of seen headers).
- **Stateless** — the server keeps no memory of you between requests (HTTP's default); state is
  added via **cookie / server session / JWT**.
- **Cache-Control / ETag / 304** — HTTP's caching directives and conditional-revalidation.
- **CDN / edge cache / PoP** — distributed caches serving content near the user (via anycast).
- **Content negotiation** — agreeing on format/language/encoding via `Accept*` ↔ `Content-*`.
- **REST / gRPC / WebSocket / SSE** — the four dominant API styles.

## Module 07 — RF & Wireless Basics

- **EM wave** — electromagnetic wave; radio and light are the same physics at different frequencies.
- **Frequency / wavelength** — oscillations per second (Hz) / physical length of one cycle;
  `λ = c/f`, shortcut `λ(m) ≈ 300/f(MHz)`.
- **Band** — a named range of frequencies (VHF, UHF, SHF…); **sub-6 GHz** vs **mmWave**.
- **dB** — logarithmic *ratio* of two powers (+3 dB = ×2, +10 dB = ×10).
- **dBm** — *absolute* power referenced to 1 mW (0 dBm = 1 mW, 30 dBm = 1 W).
- **dBi** — antenna gain relative to an ideal isotropic radiator.
- **Path loss / FSPL** — power lost as the wave spreads with distance and frequency (~6 dB per
  doubling of either).
- **Noise floor** — the ambient noise power a receiver hears even with no signal.
- **Receiver sensitivity** — minimum signal power a radio needs to decode a given modulation.
- **Link budget** — the trip as dB arithmetic: TX power + gains − losses = RX power.
- **Isotropic antenna** — theoretical antenna radiating equally in all directions; the gain reference.
- **Beamforming** — steering an antenna array so waves add up toward one user, boosting SNR.
- **Doppler shift** — frequency shift from relative motion of TX and RX.
- **Licensed / unlicensed (ISM)** — carrier-owned exclusive spectrum vs open shared bands
  (Wi-Fi, Bluetooth).
- **FDD / TDD** — duplexing by separate frequencies (both directions at once) vs shared frequency
  split in time.
- **Frequency reuse / cell** — reusing spectrum in geographically separated cells because path
  loss isolates them.

## Module 08 — Wi-Fi (802.11)

- **802.11 / Wi-Fi** — the IEEE standard family (and its marketing name) for wireless LAN; an
  L1+L2 technology sharing Ethernet's MAC addressing.
- **AP / STA / BSS** — access point (radio base station) / station (client) / the AP plus its
  clients (one "neighborhood").
- **SSID / BSSID** — network name (human-facing, non-unique) / an AP's MAC address (the real L2
  identifier).
- **DIFS / SIFS** — interframe spaces; the longer gap before a new transmission / the short gap
  before high-priority follow-ups like ACKs.
- **Backoff / contention window** — the random idle countdown a station waits before transmitting;
  doubles on failure (exponential backoff).
- **ACK (link-layer)** — Wi-Fi acknowledgement; its absence signals a lost frame and triggers L2
  retransmission (unlike Ethernet, which leaves recovery to TCP).
- **NAV** — Network Allocation Vector; virtual carrier sense — a countdown other stations honor
  based on a frame's announced Duration.
- **Hidden node / RTS/CTS** — two stations that can't hear each other but share an AP / the
  handshake (Request/Clear to Send) that reserves the medium via NAV to protect them.
- **Beacon / probe / association** — the AP's periodic advertisement / a station's active query /
  the process of formally joining a BSS.
- **DTIM / TIM / TWT** — beacon elements that let sleeping stations know when buffered traffic
  awaits / the negotiated wake schedule in Wi-Fi 6.
- **WEP / WPA2 / WPA3** — obsolete/broken / current-standard (AES-CCMP, 4-way handshake) /
  best-practice (SAE "Dragonfly", forward secrecy) security.
- **MIMO / MU-MIMO / spatial stream** — multiple antennas sending independent data streams / to
  multiple clients at once / one such independent stream.
- **OFDMA / resource unit** — subdividing a channel among several stations in one transmission
  (borrowed from LTE) / the sub-channel each gets.
- **802.11r / k / v** — fast roaming (pre-shared keys) / neighbor reports / network-suggested AP
  steering.

## Module 09 — Cellular Architecture

- **3GPP** — the standards consortium that writes GSM/UMTS/LTE/5G specs, published as numbered
  *Releases*.
- **Carrier / operator** — the company that owns spectrum and runs the network.
- **UE (User Equipment)** — 3GPP's term for the user's device (OS + baseband modem + SIM).
- **SIM / USIM** — the smartcard (or eSIM) holding subscriber identity + secret key; USIM is the
  LTE-era application on it.
- **IMSI** — International Mobile Subscriber Identity; permanent *subscriber* identity, on the SIM.
- **IMEI** — International Mobile Equipment Identity; permanent *hardware* identity, in the phone
  (`*#06#`).
- **GUTI / TMSI** — temporary identities the MME assigns so your permanent IMSI isn't broadcast
  over the air (privacy).
- **E-UTRAN** — LTE's radio access network (the eNodeBs).
- **eNodeB (eNB)** — the LTE base station; terminates the air interface and *schedules* all radio
  transmissions.
- **gNB** — the 5G base station (NR).
- **EPC (Evolved Packet Core)** — LTE's all-IP core network.
- **MME (Mobility Management Entity)** — control-plane brain: attach, authentication, mobility
  tracking, paging control. Never carries user data.
- **S-GW (Serving Gateway)** — user-plane mobility anchor; forwards packets between eNodeB and P-GW.
- **P-GW (PDN Gateway)** — user-plane exit to the internet; assigns the UE's IP and does NAT.
- **HSS (Home Subscriber Server)** — master subscriber database (identity + key + entitlements).
- **PCRF** — Policy & Charging Rules Function; sets QoS and billing rules.
- **Uu / S1-MME / S1-U / X2 / S5-S8** — the named interfaces (air / control / user / inter-eNB /
  core).
- **Control plane vs user plane** — signaling (who decides) vs actual data traffic (who carries).
- **EPS bearer** — a logical, QoS-tagged pipe from UE to P-GW. *Default* (best-effort, always-on)
  vs *dedicated* (on-demand, e.g. VoLTE).
- **QCI** — QoS Class Identifier; the integer selecting a bearer's priority/delay/loss profile.
- **TEID** — Tunnel Endpoint Identifier; the label in a GTP header naming which bearer/UE a tunnel
  belongs to.
- **Tracking Area (TA)** — a group of cells; the granularity to which the network tracks an idle phone.
- **Paging** — broadcasting to all cells in a Tracking Area to locate an idle UE for incoming data.
- **VoLTE** — Voice over LTE; phone calls carried as IP packets on a dedicated bearer.
- **5GC / AMF / SMF / UPF** — the 5G Core and its split functions (mobility control / session
  control / user-plane forwarding).
- **NSA vs SA** — Non-Standalone (5G radio on a 4G core) vs Standalone (full 5G radio + core).
- **CUPS** — Control and User Plane Separation; architecting the two planes as independent,
  separately-scalable functions.
- **Network slicing** — carving one physical 5G network into multiple virtual networks with
  distinct QoS.

## Module 10 — The LTE Air Interface

- **OFDM** — Orthogonal Frequency-Division Multiplexing: split a channel into many narrow,
  non-interfering subcarriers carrying slow parallel symbol streams; defeats multipath.
- **SC-FDMA** — the low-PAPR uplink variant of OFDM, chosen to save phone battery.
- **Subcarrier** — one 15 kHz frequency slice of the OFDM grid.
- **Cyclic prefix (CP)** — a copied guard interval prepended to each symbol to absorb echoes.
- **Resource Element (RE)** — one subcarrier × one OFDM symbol; carries one modulation symbol.
- **OFDM symbol** — one time-column of the grid (~71 µs); 7 per slot.
- **Resource Block (RB) / PRB** — 12 subcarriers × one 0.5 ms slot (= 84 REs); the unit the
  scheduler allocates.
- **Slot / Subframe / Frame (time-domain)** — 0.5 ms (7 symbols) / 1 ms = 2 slots = one TTI /
  10 ms.
- **TTI (Transmission Time Interval)** — the 1 ms scheduling heartbeat.
- **MCS (Modulation and Coding Scheme)** — index (0–28) bundling modulation order + code rate.
- **Code rate** — fraction of transmitted bits that are actual data (rest is error-correction).
- **CQI (Channel Quality Indicator)** — the phone's 0–15 report of the best MCS it can decode.
- **RSRP / RSRQ / SINR** — measured signal power / quality / signal-to-interference-plus-noise.
- **MIMO** — multiple antennas for spatial multiplexing (speed), diversity (robustness), or
  beamforming (steering).
- **PDSCH / PUSCH** — physical downlink/uplink *shared* channels: user data.
- **PDCCH / PUCCH** — physical downlink/uplink *control* channels: grants, ACK/NACK, CQI.
- **PBCH / PSS / SSS / Reference signals** — broadcast channel / sync signals a phone finds first /
  known pilot symbols for channel estimation.
- **HARQ** — Hybrid ARQ: PHY/MAC retransmission that *soft-combines* failed copies.
- **EARFCN** — the number identifying an LTE carrier's frequency/channel.

## Module 11 — The LTE Protocol Stack

- **PDCP (Packet Data Convergence Protocol)** — top of the user-plane L2 — does ROHC header
  compression, ciphering + integrity protection, reordering/in-order delivery, and duplication.
- **RLC (Radio Link Control)** — L2 layer that does ARQ retransmission, plus segmentation and
  reassembly of packets to fit radio grants. Runs in mode TM, UM, or AM.
- **MAC (LTE Medium Access Control)** — L2 layer that schedules and multiplexes logical channels
  onto transport channels, drives HARQ, runs random access, addresses via RNTI, and does
  logical-channel prioritization.
- **RRC (Radio Resource Control)** — control-plane "brain": broadcasts system information, sets
  up/reconfigures/releases the radio connection and bearers, configures measurements, drives
  handover, and controls RRC states.
- **NAS (Non-Access Stratum)** — control signaling between the phone and the core (MME) —
  registration, authentication, mobility & session management — carried transparently over RRC.
- **ROHC (Robust Header Compression)** — PDCP scheme that compresses ~40B IP/UDP/RTP headers to
  ~1–3B over the air by sending only what changed against an agreed context.
- **ARQ (Automatic Repeat reQuest)** — retransmission based on ACK/NACK feedback; RLC's L2 form
  (in AM mode) is what makes cellular differ from Ethernet's detect-and-drop.
- **Logical channels** — streams defined by *what* traffic they carry (broadcast, paging,
  dedicated control/traffic).
- **Transport channels** — the *how*: the delivery mechanisms PHY offers; MAC maps logical onto
  transport channels.
- **RLC modes — TM / UM / AM** — Transparent (no header/retransmit, broadcast), Unacknowledged
  (reorders, no retransmit — voice), Acknowledged (ARQ retransmit + in-order — data).
- **Transport block** — the chunk of data PHY carries in one scheduling opportunity; bottom of the
  encapsulation ladder.
- **SDAP** — 5G-only layer above PDCP that maps IP/QoS flows to radio bearers (not in LTE).

## Module 12 — Paging, RRC States & Handover

- **RRC_IDLE** — no radio connection; network knows the UE only by tracking area; UE must be paged
  and promoted before data flows. Best battery, worst first-packet latency.
- **RRC_CONNECTED** — active radio connection with dedicated resources; network knows the exact
  cell and can schedule immediately. Best latency, worst battery.
- **RRC_INACTIVE** — 5G state that keeps the RRC + core-network context suspended, so the UE can
  *resume* far faster than IDLE→CONNECTED while sleeping nearly as efficiently.
- **RACH (Random Access Channel)** — the contention-based procedure (preamble → RAR → request →
  contention resolution) by which a UE with no uplink grant gets the tower's attention.
- **P-RNTI** — the shared Paging RNTI all idle UEs monitor on the PDCCH to detect paging (fixed
  value `FFFE`).
- **DRX (Discontinuous Reception)** — the agreed schedule of when the UE's receiver is awake;
  idle-mode DRX aligns wake-ups with paging occasions, connected-mode DRX micro-sleeps between
  data bursts.
- **eDRX (extended DRX)** — DRX with very long cycles (minutes to hours) for IoT devices, trading
  reachability for battery.
- **TAU (Tracking Area Update)** — the signalling a UE sends when it leaves its registered tracking
  area (or periodically), keeping the core's location record current so paging is targeted.
- **Handover** — the network-controlled transfer of a CONNECTED UE from one cell to another as it
  moves; may be X2/Xn-based (fast, direct) or S1-based (via the core).
- **RLF (Radio Link Failure)** — the UE's declaration that the radio link is broken; triggers RRC
  re-establishment, and if that fails, a drop to IDLE (a dropped call).
- **Measurement events (A1–A5)** — the conditions on serving/neighbour signal strength that make
  the UE send a measurement report; **A3** (neighbour > serving + offset) is the classic handover
  trigger.

## Module 13 — Latency, End to End

- **TTFB (time to first byte)** — time from sending the request to the first byte of the response
  arriving (≈ 1 RTT + server processing).
- **Bandwidth-delay product (BDP)** — bandwidth × RTT; the data that fits "in flight" at once.
  Your TCP window must be ≥ BDP to fill the pipe.
- **Percentiles (p50/p95/p99)** — the latency distribution. p50 is typical; p99 is the tail that
  dominates multi-request page loads.
- **MEC (Multi-access Edge Computing)** — compute at the cell site, cutting backhaul + core
  propagation.

## Module 14 — Constrained & IoT Devices

- **NB-IoT** — Narrowband IoT (LTE Cat-NB1/NB2). 180 kHz radio, deepest coverage (~164 dB MCL),
  very low data rate, best for stationary meters/sensors. No voice, no in-motion handover.
- **LTE-M** — LTE Cat-M1 / eMTC. 1.4 MHz, up to ~1 Mbps, supports mobility and voice; higher
  capability, slightly less deep coverage than NB-IoT.
- **PSM (Power Saving Mode)** — device stays registered but powers the radio fully off; unreachable
  until it wakes for a TAU or to send data. Enables microamp sleep and years of battery — at the
  cost of downlink reachability.
- **LPWAN** — Low-Power Wide-Area Network. Umbrella term for long-range, low-power, low-data
  technologies (NB-IoT, LTE-M, LoRaWAN, Sigfox).
- **LoRaWAN** — open MAC/network protocol over the LoRa (Chirp Spread Spectrum) physical layer;
  unlicensed ISM spectrum, star-of-stars topology, self-hostable gateways, tiny payloads.
- **MQTT** — Message Queuing Telemetry Transport. Lightweight publish/subscribe protocol via a
  central broker, tiny 2-byte header, over TCP. The IoT fleet workhorse.
- **CoAP** — Constrained Application Protocol. RESTful (GET/PUT/POST/DELETE) like HTTP but with a
  4-byte binary header, running over UDP (no handshake). RFC 7252.
- **DTLS** — Datagram TLS. TLS adapted to run over UDP (tolerates loss/reordering); used to secure
  CoAP (`coaps`). Often paired with pre-shared keys or Connection ID on tiny devices.
- **RedCap** — Reduced Capability NR ("NR-Light", 3GPP Rel-17). New 5G radio for the mid-tier
  between LPWA and full 5G — fewer antennas, less bandwidth, ~150 Mbps — for wearables, sensors,
  mid-tier cameras.
- **mMTC** — massive Machine-Type Communication. The 5G pillar for connecting ~1M devices/km²; in
  practice delivered by NB-IoT and LTE-M.

## Module 15 — VPNs & Tunneling

- **Tunnel** — a path that carries one network's packets encapsulated inside another network's
  packets, usually encrypted.
- **Overlay / underlay** — overlay = the virtual private network you perceive; underlay = the real
  physical network actually forwarding the outer packets.
- **IPsec** — a suite securing IP at L3; the classic enterprise/site-to-site choice.
- **ESP / AH** — ESP = Encapsulating Security Payload (encrypts + authenticates — the one used);
  AH = Authentication Header (authenticates only; NAT-incompatible; rare).
- **IKE** — Internet Key Exchange (IKEv2); IPsec's handshake that authenticates peers and derives
  keys, analogous to the TLS handshake.
- **SA (Security Association)** — the one-directional negotiated bundle of keys/algorithms/parameters
  for a tunnel; a working IPsec tunnel needs a pair.
- **WireGuard** — modern, tiny, UDP-only VPN using the Noise framework and public-key identity; the
  current default.
- **OpenVPN** — mature TLS/DTLS-based VPN; uses X.509 certs and the full TLS machinery over a single
  UDP/TCP port.
- **Split tunneling** — routing only some traffic through the VPN and the rest directly, trading
  privacy for latency.
- **NAT traversal** — techniques (inside-out initiation, NAT-T/UDP 4500, hole punching) that let
  tunnels work through NAT.
- **DNS leak** — DNS queries escaping the tunnel to the original resolver, exposing visited
  hostnames despite encryption.

## Module 16 — The RF Underworld (SDR, sniffing, jammers)

- **SDR (Software-Defined Radio)** — a radio whose demodulation/decoding is done in software over
  raw I/Q samples, making one piece of hardware handle many signal types.
- **RTL-SDR** — a ~$30 **receive-only** USB dongle (repurposed DVB-T tuner); the standard learning
  tool. Cannot transmit.
- **HackRF / LimeSDR / USRP** — wider-range, **transmit-capable** SDRs for research/labs;
  transmitting is heavily regulated.
- **I/Q samples** — paired in-phase/quadrature values capturing a wave's amplitude *and* phase; the
  raw data an SDR processes.
- **Waterfall / spectrogram** — a scrolling plot of signal power vs frequency over time; how you
  *see* the airwaves.
- **IMSI catcher / stingray** — a rogue base station impersonating a real cell tower to identify and
  track nearby phones, exploiting weak authentication (2G) and downgrade lures.
- **Downgrade attack** — forcing a device onto an older, weaker protocol (e.g. 4G→2G) where security
  is missing.
- **Jamming** — flooding a band with noise/carrier to collapse SNR and deny service. **Illegal and
  dangerous everywhere.**
- **GPS spoofing** — transmitting counterfeit satellite signals to induce a false position/time in a
  receiver.
- **Replay attack** — capturing a valid transmission and re-sending it later to trigger an effect
  (e.g. fixed-code remotes); beaten by rolling codes / freshness proofs.
