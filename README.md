<p align="center">
  <img src="https://img.shields.io/badge/🩸-THE%20100%2C000%20GATE-darkred?style=for-the-badge&labelColor=000000" alt="The 100,000 Gate" />
</p>

<h1 align="center">🔥 The 100,000 Gate</h1>

<p align="center">
  <em>A cinematic horror web experience. Every click brings you closer to opening what should never be opened.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/Three.js-3D-black?style=flat-square&logo=three.js" />
  <img src="https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-green?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-black?style=flat-square&logo=socket.io" />
  <img src="https://img.shields.io/badge/Framer_Motion-purple?style=flat-square&logo=framer" />
</p>

---

## 🎮 About

**The 100,000 Gate** is an interactive, collaborative horror experience where visitors collectively click to reach **100,000** — unlocking a dark secret behind an ancient gate.

Built with a cinematic 3D gate scene, eerie sound design, glitch effects, and real-time synchronization — every visitor contributes to the same global counter. When the gate opens… *there is no going back.*

---

## ✨ Features

- 🏛️ **3D Gate Scene** — Fully rendered ancient gate with pillars, runes, embers, and fog using React Three Fiber
- 🎭 **Multi-Chamber Flow** — Immersive progression: Gate → Identity → Location → Counter Room
- 🩸 **Horror Effects** — Blood drips, glitch text, screen shake, chromatic aberration, lightning flashes
- 🔊 **Procedural Audio** — Ambient drones, heartbeat, wind, and gate creak — all generated in real-time via Web Audio API
- 🌍 **Global Counter** — Shared counter persisted in MongoDB, synced across all visitors
- ⚡ **Real-Time Sync** — Socket.io broadcasts every click to all connected users instantly
- 💀 **100K Unlock Event** — Full-screen horror sequence when the counter hits 100,000
- 📱 **Fully Responsive** — Optimized for screens from 320px mobile to 1440px+ desktop

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe components |
| [React Three Fiber](https://r3f.docs.pmnd.rs/) | 3D scene rendering |
| [Three.js](https://threejs.org/) | 3D graphics engine |
| [Framer Motion](https://motion.dev/) | Page transitions & animations |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [GLSL Shaders](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language) | Custom fog effects |

### Backend
| Technology | Purpose |
|---|---|
| [Express.js](https://expressjs.com/) | REST API server |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Data persistence |
| [Socket.io](https://socket.io/) | Real-time WebSocket communication |

---

## 📁 Project Structure

```
The 100,000 Gate/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── api/counter/         # Next.js API route (MongoDB)
│   │   ├── globals.css          # Global styles & animations
│   │   ├── layout.tsx           # Root layout with fonts
│   │   └── page.tsx             # Main page — chamber navigation
│   ├── components/
│   │   ├── GateScene.tsx        # 3D gate (React Three Fiber)
│   │   ├── FirstGate.tsx        # Landing screen with 3D gate
│   │   ├── IdentityChamber.tsx  # "What is your name?" screen
│   │   ├── LocationChamber.tsx  # "Where are you from?" screen
│   │   ├── CounterRoom.tsx      # Main click counter + unlock
│   │   ├── BloodDrips.tsx       # Blood drip SVG overlay
│   │   └── ParticlesOverlay.tsx # Floating particle effects
│   └── lib/
│       ├── mongodb.ts           # Mongoose connection (cached)
│       └── Counter.ts           # Counter model for Next.js API
│
└── backend/                     # Express.js server (optional)
    ├── server.js                # Express + Socket.io server
    ├── models/Counter.js        # Mongoose counter model
    ├── routes/counter.js        # REST API endpoints
    ├── .env                     # Environment variables
    └── Dockerfile               # Docker support
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (local) or [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/the-100000-gate.git
cd the-100000-gate
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file (or use the existing MongoDB connection):
```env
MONGODB_URI=mongodb://localhost:27017/the100000gate
```

Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the gate awaits.

---

## 🌐 Deployment

### Frontend → Vercel (Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable:
5. Deploy 🚀

### Backend → Render / Railway (For real-time sync)

1. Create a new Web Service on [Render](https://render.com)
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add the same `MONGODB_URI` environment variable

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/counter` | Fetch current global count |
| `POST` | `/api/counter` | Increment counter by 1 |
| `GET` | `/api/counter/status` | Detailed status (progress %, unlock state) |
| `GET` | `/api/health` | Server health check |

### WebSocket Events (Backend)

| Event | Direction | Description |
|---|---|---|
| `counter:update` | Server → Client | Broadcasts updated count |
| `counter:click` | Client → Server | User clicked the button |
| `counter:unlocked` | Server → Client | 100K reached — gate opens |

---

## 🎨 The Experience

1. **The Gate** — A 3D ancient gate looms before you. Embers rise. Lightning flashes. *Enter if you dare.*
2. **Identity Chamber** — *"What is your name?"* — The gate demands to know who enters.
3. **Location Chamber** — *"Where are you from?"* — Your origin will not save you here.
4. **The Counter Room** — Click. Every click echoes globally. The progress bar creeps toward 100,000.
5. **The Unlocking** — *"You opened what should never have been opened."* — Full-screen horror. Glitch. Blood. Static. **There is no going back.**

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>🩸 Some doors should remain closed. 🩸</strong>
</p>
