
# Chitchat Web Frontend

This is the frontend for the Chitchat application. It is built with Next.js, React, Tailwind CSS, and socket.io-client.

## Features
- Real-time chat messaging
- User authentication (login, register, JWT/cookies)
- Dashboard with sidebar navigation
- Chat list, chat box, friend requests, user search
- Responsive design (mobile and desktop)
- TypeScript throughout

## Setup

### Local Development
```bash
pnpm install
pnpm dev
```

Frontend will be available at [http://localhost:3000](http://localhost:3000)

### Docker Compose
```bash
docker compose build --no-cache
docker compose up
```

## Environment Variables
- `.env.production`: `NEXT_PUBLIC_API_URL=http://api:5000/api` (for Docker Compose)

## Main Pages & Components
- `/login`, `/register`: Auth pages
- `/dashboard`: Main dashboard
- `/dashboard/chats`: Chat list and chat box
- `/dashboard/friends`: Friends list and send message
- `/dashboard/users`: Find friends
- `/dashboard/pending-requests`: Friend requests
- `components/layout/ChatSidebar.tsx`: Sidebar navigation
- `components/layout/ChatBox.tsx`: Chat messages and input
- `components/layout/Navbar.tsx`: Top navigation

## Technologies
- Next.js, React, Tailwind CSS, socket.io-client, TypeScript

## How it Works
- Uses `NEXT_PUBLIC_API_URL` for all API requests
- Connects to backend via socket.io for real-time messaging

## Contributing
1. Clone the repo
2. Install dependencies with `pnpm install`
3. Use `pnpm dev` for local dev
4. Use Docker Compose for full-stack testing

## License
MIT
