import { Socket, Server } from "socket.io";
import jwt from "jsonwebtoken";
import { saveMessagesToDb, findOrCreateConversation } from "./controllers/messageControllers";
import prisma from "./config/db.config";
import * as cookie from "cookie";

export const setupSocketIO = (io: Server) => {
  const JWT_SECRET: string = process.env.ACCESS_TOKEN_SECRET ?? "your_jwt_secret";

  console.log("Setting up Socket.IO with JWT_SECRET:", JWT_SECRET ? "Present" : "Missing");

  // Authentication Middleware
  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error("No cookie token found"));
    }

    // Parse cookies string into object
    const parsedCookies = cookie.parse(cookies);

    const token = parsedCookies.accessToken;
    console.log("Authentication attempt with token:", token ? "Token provided" : "No token");

    try {
      if (!token) {
        return next(new Error("No access token provided"));
      }
      const decoded = jwt.verify(token as string, JWT_SECRET);

      (socket as any).user = decoded;

      console.log("Token verified for user:", (decoded as any).id);

      next();
    } catch (error) {
      console.log("Token verification failed:", (error as Error).message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`New User connected: ${socket.id}`);

    // Extract senderId securely from authenticated socket user
    const senderId = (socket as any).user?.id;

    if (!senderId) {
      console.log("No senderId found, disconnecting socket");
      socket.disconnect(true);
      return;
    }

    console.log(`User ${senderId} joined room: ${senderId.toString()}`);

    // Join personal room for this user to support multi-device or tabs
    socket.join(senderId.toString());

    // Handle private messages
    socket.on("private_message", async ({ receiverId, message }) => {
      console.log(`Private message from ${senderId} to ${receiverId}:`, message);

      try {
        // Find or create conversation between sender and receiver
        const conversation = await findOrCreateConversation(senderId, receiverId);

        // Save message to database
        const savedMessage = await saveMessagesToDb(conversation.id, senderId, message);

        // Prepare consistent message payload matching client fields
        const messagePayload = {
          id: savedMessage.id,
          content: savedMessage.content,  // Changed from message to content for client compatibility
          senderId: senderId,
          conversationId: conversation.id,
          createdAt: savedMessage.createdAt,
          sender: savedMessage.sender,
        };

        // Emit the message event with same event name to both sender and receiver
        io.to(receiverId.toString()).emit("private_message", messagePayload);
        io.to(senderId.toString()).emit("private_message", messagePayload);

        console.log("Message saved and emitted to rooms:", receiverId.toString(), "and", senderId.toString());
      } catch (error) {
        console.error("Error processing message:", error);

        // Send error back to sender
        socket.emit("message_error", {
          error: "Failed to send message",
          originalMessage: message,
          receiverId,
        });
      }
    });

    // Handle typing indicator with room emission
    socket.on("typing", ({ receiverId, isTyping }) => {
      io.to(receiverId.toString()).emit("user_typing", {
        senderId: senderId,
        isTyping: isTyping,
      });
    });

    // Handle message status updates (delivered, read)
    socket.on("message_status", async ({ messageId, status }) => {
      try {
        // Update message status in database
        const updatedMessage = await prisma.messages.update({
          where: { id: messageId },
          data: { status: status },
          include: {
            sender: true,
          },
        });

        // Notify the sender about status change
        io.to(updatedMessage.senderId.toString()).emit("message_status_updated", {
          messageId: messageId,
          status: status,
          updatedAt: updatedMessage.updatedAt,
        });
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
