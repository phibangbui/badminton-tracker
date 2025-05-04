Install dependencies:

cd frontend
pnpm install

cd ../backend
pnpm install

Build the frontend:

cd frontend
pnpm build

Run database migrations:

cd ../backend
npx prisma migrate dev --name init
npx prisma generate

Start the backend server (serves frontend too):

pnpm run build 
pnpn run start

Expose to internet via Cloudflare Tunnel:
cloudflared tunnel --url http://localhost:3001
Use the generated URL (e.g., https://your-name.trycloudflare.com) to access the app from your phone or other devices.
