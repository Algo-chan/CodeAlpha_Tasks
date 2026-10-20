# CollabRoom — Real-Time Video Conferencing & Collaboration Platform

CollabRoom is a production-grade, real-time video conferencing, digital whiteboard, and encrypted file collaboration platform. Crafted adhering strictly to **Apple's Human Interface Guidelines (HIG)**, it combines fluid spring physics, frosted glass materials, and an ultra-low latency WebRTC mesh network.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │          CollabRoom Client           │
                      │  React 18 + Vite + Tailwind + Zustand │
                      └──────────────┬───────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           │ HTTP/REST (Port 3001)                             │ WebSocket (Socket.io)
           ▼                                                   ▼
┌─────────────────────────┐                         ┌─────────────────────────┐
│     Express Server      │                         │  Socket.io Gateway      │
│  - JWT Auth (Access/Ref)│                         │  - Room & Peer State    │
│  - Room Management      │                         │  - WebRTC Signaling     │
│  - AES-256-GCM Storage  │                         │  - Vector Whiteboard    │
│  - Zod Validation       │                         │  - Real-Time Chat       │
│  - Helmet CSP & RateLim │                         │  - Socket Rate Limiting │
└──────────┬──────────────┘                         └───────────┬─────────────┘
           │                                                    │
           └─────────────────────────┬──────────────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  MongoDB Server │
                            │ (Users, Rooms,  │
                            │  Files, Chat)   │
                            └─────────────────┘

                Peer-to-Peer WebRTC Media Mesh (DTLS-SRTP)
     ┌──────────────────────────────────────────────────────────────┐
     │  Client A (Browser) <══════════════════> Client B (Browser)  │
     │      ▲                                           ▲           │
     │      ╚═══════════════ Client C (Browser) ════════╝           │
     └──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Client** | React 18, Vite 5, Tailwind CSS 3, Framer Motion 11, React Router 6, Zustand, Lucide Icons, SimplePeer |
| **Server** | Node.js (ESM), Express 4, Socket.io 4, Mongoose 8, JWT, bcryptjs, Multer, Helmet, express-mongo-sanitize, express-rate-limit, Zod |
| **Media & P2P** | WebRTC mesh (`simple-peer`), STUN/TURN signaling, Web Audio API Analyser, `RTCRtpSender.setParameters()` adaptive bitrate |
| **Storage & Security** | Local disk / S3-compatible, AES-256-GCM encryption at rest, time-limited signed download tokens, DTLS-SRTP media encryption |

---

## Prerequisites

- **Node.js**: `v20.0.0` or higher (verified on Node.js 24)
- **npm**: `v9.0.0` or higher
- **MongoDB**: MongoDB Atlas cloud cluster (free at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)), a local MongoDB Community service (`mongodb://localhost:27017/collabroom`), or Docker (`docker compose up -d`).

> **Note on Docker:** Docker is **completely optional**. You do not need Docker installed to run or develop CollabRoom. Using MongoDB Atlas or a local MongoDB service works out of the box with `npm run dev`.

---

## Quick Start (Local Development)

### 1. Install Dependencies
Run the install command across the root, client, and server:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure MongoDB URI is set (e.g. `mongodb://localhost:27017/collabroom` or your Atlas cluster URL).

### 3. (Optional) Start MongoDB with Docker
If you have Docker installed:
```bash
docker compose up -d
```

### 4. Start the Application
Start both the client development server (`http://localhost:5173`) and the API/signaling server (`http://localhost:3001`):
```bash
npm run dev
```

### 5. Create an Account or Join as Guest
Open `http://localhost:5173` in your browser. Click **Get Started** to register your personal account, or navigate directly to any room link to join as an authenticated or guest participant.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3001` | Express API and Socket.io signaling port |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin for client web app |
| `MONGO_URI` | Yes | `mongodb://localhost:27017/collabroom` | MongoDB connection string |
| `JWT_SECRET` | Yes | `...` | Secret key for 15-minute access tokens and download URLs |
| `JWT_REFRESH_SECRET` | Yes | `...` | Secret key for 7-day httpOnly refresh cookies |
| `ENCRYPTION_KEY` | Yes | `...` | 32-byte key used for AES-256-GCM encryption at rest |
| `STORAGE_DRIVER` | No | `local` | Storage driver (`local` or `s3`) |
| `MAX_FILE_SIZE_MB` | No | `50` | Maximum file upload size in Megabytes |
| `MAX_PARTICIPANTS` | No | `8` | Maximum concurrent participants allowed in a room |
| `STUN_URL` | No | `stun:stun.l.google.com:19302` | Public STUN server for ICE candidate discovery |
| `TURN_URL` | No | `""` | Optional TURN server URL (e.g. `turn:turn.domain.com:3478`) |
| `TURN_USERNAME` | No | `""` | TURN authentication username |
| `TURN_CREDENTIAL` | No | `""` | TURN authentication credential |

---

## Testing Multi-User Video & Collaboration

To test peer-to-peer audio, video, whiteboard sync, and encrypted file sharing on a single machine:

1. Open **Browser 1** (e.g. Chrome) and navigate to `http://localhost:5173`.
2. Sign in or click **Get Started** to create your account (or join directly as a Guest).
3. From the Dashboard, click **New Meeting** to generate an instant conference room.
4. In the **Pre-Join Screen**, verify your camera and microphone preview, then click **Join Meeting Now**.
5. Copy the room link or short code from the top header bar.
6. Open **Browser 2** (an Incognito tab or another browser such as Edge/Firefox/Brave).
7. Paste the meeting URL (`http://localhost:5173/join/<room-id>`).
8. Enter a display name and click **Join Meeting Now**.
8. Both windows will immediately establish WebRTC P2P streams:
   - See and hear both participant video tiles with active speaker detection.
   - Click the **Whiteboard (W)** icon in one window and draw: watch vector strokes and remote cursors sync in real time.
   - Click the **Screen Share (S)** button: the remote window automatically transitions to the spotlight layout.
   - Drag & drop a file into the **Files** side panel tab: it is encrypted with AES-256-GCM, stored, and instantly available for download in the other window.

---

## Local HTTPS Setup (for External & Mobile Testing)

Modern browsers strictly require a **Secure Context (HTTPS or localhost)** to access `navigator.mediaDevices.getUserMedia()` and `getDisplayMedia()`. If you access CollabRoom from another device on your LAN (e.g. `http://192.168.1.50:5173`), media devices will be blocked by browser security policies.

To test across devices on your local network:

1. Install [mkcert](https://github.com/FiloSottile/mkcert):
   ```bash
   mkcert -install
   mkcert localhost 127.0.0.1 ::1 192.168.x.x
   ```
2. Pass the generated `cert.pem` and `key.pem` to Vite's `server.https` configuration in `client/vite.config.js`.

---

## Security Architecture (Verified & Hardened)

1. **WebRTC Media Encryption**:
   All peer-to-peer audio, video, and data channels are end-to-end encrypted by default at the transport layer using **DTLS-SRTP** (Datagram Transport Layer Security / Secure Real-time Transport Protocol). No media passes unencrypted through the server.
2. **File Encryption at Rest (AES-256-GCM)**:
   Uploaded files never hit disk in raw format. Every file is encrypted using an ephemeral 32-byte key in Galois/Counter Mode (GCM) providing both confidentiality and cryptographic authenticity verification.
3. **Time-Limited Signed URLs**:
   File downloads require cryptographic tokens signed by the server (`JWT_SECRET`) valid for 15 minutes. Unauthenticated or expired requests are rejected.
4. **Content Security Policy (CSP)**:
   Enforced via Helmet with strict directives restricting scripts, frames, and socket transport endpoints.
5. **NoSQL Injection Sanitization**:
   All request parameters and bodies are sanitized via `express-mongo-sanitize` to strip `$` and `.` operators.
6. **Per-Socket Rate Limiting**:
   WebSocket events are monitored through a sliding window limiter preventing flood attacks.
7. **Bcrypt 12 Rounds**:
   User authentication uses salted Bcrypt hashing with 12 computational rounds.

---

## Known Limitations & Production SFU Migration

### Mesh WebRTC Limitations
CollabRoom implements a **mesh WebRTC topology** (`simple-peer`). In mesh mode, each participant maintains an upstream and downstream connection to every other participant:
- Bandwidth and CPU scale at $O(N^2)$ relative to room size.
- Mesh is reliable and optimal for **4 to 6 concurrent active video participants**.
- A hard default cap is enforced via `MAX_PARTICIPANTS=8` (configurable in `.env`).

### Migration Path to Selective Forwarding Unit (SFU)
For rooms requiring 10 to 100+ participants:
- Replace the `SimplePeer` mesh instances in `client/src/hooks/useWebRTC.js` with an SFU client SDK such as **LiveKit** (`livekit-client`) or **mediasoup**.
- With an SFU, each client publishes only 1 upstream video/audio track to the media server, which forwards simulcast streams to subscribers ($O(N)$ efficiency).

---

## Running Unit Tests

Run the backend unit test suite (covering password hashing, token expiration, AES-256-GCM roundtrip, and whiteboard event reducer):
```bash
npm test --prefix server
```

---

## Production Deployment Guide

1. **Build Client Assets**:
   ```bash
   npm run build
   ```
   Outputs production bundles to `client/dist`.
2. **Serve with Reverse Proxy (Nginx / Caddy)**:
   Configure TLS certificates (Let's Encrypt), proxy `/api` and `/socket.io` to Node.js on port `3001`, and serve `client/dist` statically with index fallback.
3. **Process Management**:
   Run the backend cluster with PM2:
   ```bash
   pm2 start server/src/server.js --name collabroom-server -i max
   ```
