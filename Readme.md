# Badminton Tracker

A web application to track badminton games, sessions, and player statistics.

## Installation

### 1. Install Dependencies

#### Frontend
```bash
cd frontend
pnpm install
```

#### Backend
```bash
cd ../backend
pnpm install
```

### 2. Build the Frontend
```bash
cd frontend
pnpm build
```

### 3. Run Database Migrations
```bash
cd ../backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the Backend Server
The backend server also serves the frontend.
```bash
pnpm run build 
pnpm run start
```

### 5. Expose to the Internet (Optional)
Use Cloudflare Tunnel to expose the application to the internet.
```bash
cloudflared tunnel --url http://localhost:3001
```
Use the generated URL (e.g., `https://your-name.trycloudflare.com`) to access the app from your phone or other devices.
