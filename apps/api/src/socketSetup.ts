import { Socket, Server } from "socket.io";
import jwt from "jsonwebtoken";
import { saveMessagesToDb, findOrCreateConversation } from "./controllers/messageControllers";
import prisma from "./config/db.config";

export const setupSocketIO = (io: Server) => {
  const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || "your_jwt_secret";
  
  console.log("Setting up Socket.IO with JWT_SECRET:", JWT_SECRET ? "Present" : "Missing");

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    console.log("Authentication attempt with token:", token ? "Token provided" : "No token");
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

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

    // Handle socket events here
    const senderId = (socket as any).user?.id;

    if (!senderId) {
      console.log("No senderId found, disconnecting socket");
      socket.disconnect(true);
      return;
    }

    console.log(`User ${senderId} joined room: ${senderId.toString()}`);

    socket.join(senderId.toString());

    socket.on("private_message", async({ receiverId, message }) => {
      console.log(`Private message from ${senderId} to ${receiverId}:`, message);

      try {
        // Find or create conversation between sender and receiver
        const conversation = await findOrCreateConversation(senderId, receiverId);
        
        // Save message to database with correct conversationId
        const savedMessage = await saveMessagesToDb(conversation.id, senderId, message);

        // Emit to both sender and receiver with conversation details
        const messagePayload = {
          id: savedMessage.id,
          message: savedMessage.content,
          senderId: senderId,
          conversationId: conversation.id,
          createdAt: savedMessage.createdAt,
          sender: savedMessage.sender,
        };

        // Send to receiver
        io.to(receiverId.toString()).emit("private_message", messagePayload);
        
        // Send to sender (for confirmation and multi-device sync)
        io.to(senderId.toString()).emit("message_sent", messagePayload);

        console.log("Message saved and emitted to rooms:", receiverId.toString(), "and", senderId.toString());
      } catch (error) {
        console.error("Error processing message:", error);
        
        // Send error back to sender
        socket.emit("message_error", {
          error: "Failed to send message",
          originalMessage: message,
          receiverId
        });
      }
    });

    // Handle user typing indicator
    socket.on("typing", ({ receiverId, isTyping }) => {
      io.to(receiverId.toString()).emit("user_typing", {
        senderId: senderId,
        isTyping: isTyping
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
            sender: true
          }
        });

        // Notify the sender about status change
        io.to(updatedMessage.senderId.toString()).emit("message_status_updated", {
          messageId: messageId,
          status: status,
          updatedAt: updatedMessage.updatedAt
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

