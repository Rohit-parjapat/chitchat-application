# Chitchat API Documentation

This document describes the main REST API endpoints for the Chitchat backend.

## Authentication

### Register
- `POST /api/users/register`
- Body: `{ name, email, password }`
- Response: `{ user, token }`

### Login
- `POST /api/users/login`
- Body: `{ email, password }`
- Response: `{ user, token }`

### Get Current User
- `GET /api/users/me`
- Auth required (JWT cookie)
- Response: `{ user }`

### Logout
- `POST /api/users/logout`
- Auth required
- Response: `{ message }`

## Users & Friends

### List All Users
- `GET /api/users`
- Auth required
- Response: `[ { id, name, email } ]`

### Send Friend Request
- `POST /api/friends/request`
- Body: `{ receiverId }`
- Auth required
- Response: `{ message }`

### List Friends
- `GET /api/friends`
- Auth required
- Response: `[ { id, name, email } ]`

## Chat & Messaging

### List Conversations
- `GET /api/messages/conversations`
- Auth required
- Response: `[ { id, name, participants, messages } ]`

### Start New Conversation
- `POST /api/messages/conversation/new`
- Body: `{ receiverId }`
- Auth required
- Response: `{ conversation }`

### Get Messages for Conversation
- `GET /api/messages/conversations/:id/messages`
- Auth required
- Response: `[ { id, sender, content, createdAt } ]`

### Send Message
- `POST /api/messages/send`
- Body: `{ receiverId, message }`
- Auth required
- Response: `{ message }`

## Real-time Events (Socket.io)
- `private_message`: Send/receive messages in real time

## Error Handling
- Standard HTTP status codes
- Error responses: `{ message }`

## Technologies
- Express, Prisma, PostgreSQL, Redis, Socket.io, JWT, TypeScript

---
For more details, see the source code in `apps/api/src`.
