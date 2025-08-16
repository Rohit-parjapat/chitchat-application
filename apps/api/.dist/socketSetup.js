"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketIO = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const setupSocketIO = (io) => {
    const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || "your_jwt_secret";
    // Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            socket.user = decoded;
            next();
        }
        catch {
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        console.log(`New User connected: ${socket.id}`);
        // Handle socket events here
        const userId = socket.user?.id;
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
exports.setupSocketIO = setupSocketIO;
