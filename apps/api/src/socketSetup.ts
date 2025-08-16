import { Socket, Server } from "socket.io";
import jwt from "jsonwebtoken";

export const setupSocketIO = (io: Server) => {
  const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || "your_jwt_secret";

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });
  io.on("connection", (socket: Socket) => {
    console.log(`New User connected: ${socket.id}`);
    // Handle socket events here
    const userId = (socket as any).user?.id;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.join(userId.toString());

    socket.on("private_message", ({ receiverId, message }) => {
      io.to(receiverId.toString()).emit("private_message", {
        message,
        senderId: userId,
      });
    });
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
