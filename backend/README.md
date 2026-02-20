# The 100,000 Gate — Backend

## Setup & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and set your MongoDB URI and frontend URL.
3. **Start server:**
   ```bash
   npm run dev
   ```
   or for production:
   ```bash
   npm start
   ```

## API Endpoints
- `GET /api/counter` — Get current count
- `POST /api/counter/click` — Increment counter
- `GET /api/counter/status` — Get counter status
- `GET /api/health` — Health check

## WebSocket
- Connect via Socket.io for real-time counter updates.

## Docker (optional)
Build and run with Docker:
```bash
docker build -t the-100000-gate-backend .
docker run -p 5000:5000 --env-file .env the-100000-gate-backend
```
