# 🏥 Clinic Queue System

A real-time clinic queue management system built for hackathon. Two screens — receptionist dashboard and patient waiting room — stay in sync instantly via WebSockets.

---

## Live Demo

| Screen | URL |
|---|---|
| Receptionist | `https://clinic-queue-zeta.vercel.app/` |
| Waiting Room | `https://clinic-queue-zeta.vercel.app/?waiting=` |

> Open both links side by side to see live sync in action.

---

## Features

- **Real-time sync** — both screens update the moment "Call Next" is clicked, no refresh needed
- **Live wait time estimates** — computed from actual consultation start time, not hardcoded
- **Patient list** — tracks every patient today with status (waiting / serving / seen)
- **Settings panel** — configure clinic name and average consultation time
- **Mistake-proof UI** — buttons disabled when actions aren't valid, confirm dialogs on destructive actions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Real-time | Socket.io (WebSockets) |
| State | In-memory (server-side) |
| Hosting | Vercel (client) + Railway (server) |

---

## How It Works

```
Receptionist clicks "Call Next"
        ↓
Socket emits  →  queue:callNext  →  Express server
                                          ↓
                                   Mutates queue state
                                          ↓
                              io.emit("queue:update")
                           ↙                        ↘
              Receptionist tab              Waiting room tab
              re-renders instantly          re-renders instantly
```

The server is the single source of truth. Clients never modify state directly — they only emit events. The server processes them and broadcasts the updated queue to every connected socket.

---

## Project Structure

```
clinic-queue/
  server/
    index.js          ← Express + Socket.io server (in-memory queue)
    package.json
  client/
    src/
      components/
        ReceptionistView.jsx   ← Dashboard with queue, patient list, settings
        WaitingRoomView.jsx    ← Live display for patients
      hooks/
        useQueue.js            ← Socket connection + state management
      utils/
        waitTime.js            ← Wait time calculation logic
      App.jsx                  ← Route between views via ?waiting param
    package.json
  README.md
```

---

## Socket Events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `queue:update` | Server → All clients | Full queue object | Broadcast after every state change |
| `queue:add` | Client → Server | `{ name }` | Add a new patient to the queue |
| `queue:callNext` | Client → Server | — | Move next patient to serving |
| `queue:setAvg` | Client → Server | `{ minutes }` | Update avg consultation time |

---

## Wait Time Formula

```js
// src/utils/waitTime.js
function estimateWait({ pos, avgConsultMin, calledAt }) {
  const elapsed = calledAt
    ? Math.min((Date.now() - calledAt) / 60000, avgConsultMin)
    : 0;
  const firstSlot = Math.max(avgConsultMin - elapsed, 0);
  return Math.round(firstSlot + (pos - 1) * avgConsultMin);
}
```

- `firstSlot` shrinks as the current consultation progresses
- Position 1 patient sees the remaining time of the current slot
- Each subsequent patient adds one full `avgConsultMin` slot
- `Math.max(..., 0)` prevents negative estimates if a consultation runs over

---

## Concurrency Handling

**Problem:** Two receptionists click "Call Next" simultaneously.

**Solution:** Node.js is single-threaded. Both `queue:callNext` events are queued in the event loop and processed one at a time. The second handler sees the already-updated state from the first, so the same patient can never be called twice. No locking code needed.

---

## Running Locally

### Prerequisites
- Node.js 18+
- npm

### Server
```bash
cd server
npm install
node index.js
# → Server running on http://localhost:3001
```

### Client
```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

### Open two tabs
- `http://localhost:5173` — Receptionist view
- `http://localhost:5173?waiting` — Waiting room view

---

## Deployment

### Server → Railway
1. Connect GitHub repo to Railway
2. Set root directory to `server` (or add `railway.json`)
3. Railway auto-detects Node and runs `npm start`
4. Copy the generated Railway URL

### Client → Vercel
1. Connect GitHub repo to Vercel
2. Set root directory to `client`
3. Update `SOCKET_URL` in `useQueue.js` to your Railway URL
4. Vercel auto-deploys on every push to main

---

## Edge Cases Covered

| Scenario | How it's handled |
|---|---|
| Call Next on empty queue | Button disabled + server early return |
| Page refresh | Server re-sends full queue on socket reconnect |
| Consultation runs over | `Math.max(..., 0)` clamps wait to 0, not negative |
| Socket disconnect | Socket.io auto-reconnects, server pushes fresh state |
| Two tabs clicking simultaneously | Node event loop serialises — no duplicate calls |
| Invalid avg time input | `Math.max(1, value)` enforced on server |

---

## Built for

Hackathon — Queue Cure
