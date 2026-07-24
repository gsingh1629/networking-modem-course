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
