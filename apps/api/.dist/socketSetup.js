"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketIO = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const messageControllers_1 = require("./controllers/messageControllers");
const db_config_1 = __importDefault(require("./config/db.config"));
const cookie = __importStar(require("cookie"));
const setupSocketIO = (io) => {
    const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET ?? "your_jwt_secret";
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
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            socket.user = decoded;
            console.log("Token verified for user:", decoded.id);
            next();
        }
        catch (error) {
            console.log("Token verification failed:", error.message);
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        console.log(`New User connected: ${socket.id}`);
        // Extract senderId securely from authenticated socket user
        const senderId = socket.user?.id;
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
                const conversation = await (0, messageControllers_1.findOrCreateConversation)(senderId, receiverId);
                // Save message to database
                const savedMessage = await (0, messageControllers_1.saveMessagesToDb)(conversation.id, senderId, message);
                // Prepare consistent message payload matching client fields
                const messagePayload = {
                    id: savedMessage.id,
                    content: savedMessage.content, // Changed from message to content for client compatibility
                    senderId: senderId,
                    conversationId: conversation.id,
                    createdAt: savedMessage.createdAt,
                    sender: savedMessage.sender,
                };
                // Emit the message event with same event name to both sender and receiver
                io.to(receiverId.toString()).emit("private_message", messagePayload);
                io.to(senderId.toString()).emit("private_message", messagePayload);
                console.log("Message saved and emitted to rooms:", receiverId.toString(), "and", senderId.toString());
            }
            catch (error) {
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
                const updatedMessage = await db_config_1.default.messages.update({
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
            }
            catch (error) {
                console.error("Error updating message status:", error);
            }
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
exports.setupSocketIO = setupSocketIO;
