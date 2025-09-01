# Chitchat API

This is the backend for the Chitchat application. It is built with Express, Prisma, JWT, and Socket.io.

## Features
- RESTful API for users, authentication, chats, messages, friends
- Real-time messaging with Socket.io
- JWT authentication with cookies
- Prisma ORM for PostgreSQL
- Rate limiting and validation

## Setup

### Local Development
```bash
pnpm install
pnpm run dev
```

### Docker Compose
```bash
docker compose build --no-cache
docker compose up
```

API will be available at `http://localhost:5000/api` (or `http://api:5000/api` inside Docker Compose).

## Environment Variables
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- REDIS_HOST, REDIS_PORT
- ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET

## Main Endpoints
- `POST /api/users/register` — Register a new user
- `POST /api/users/login` — Login and get JWT
- `GET /api/users/me` — Get current user info
- `POST /api/users/logout` — Logout
- `GET /api/users` — List all users
- `POST /api/friends/request` — Send friend request
- `GET /api/friends` — List friends
- `GET /api/messages/conversations` — List conversations
- `POST /api/messages/conversation/new` — Start new conversation
- `GET /api/messages/conversations/:id/messages` — Get messages for a conversation
- `POST /api/messages/send` — Send a message

## Real-time Events
- Socket.io events for private messaging

## Technologies
- Express, Prisma, PostgreSQL, Redis, Socket.io, JWT, TypeScript