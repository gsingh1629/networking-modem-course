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
