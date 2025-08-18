"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriends = exports.listPendingRequests = exports.updateFriendRequestStatus = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
const index_1 = require("../index");
// Server error handler
const handleError = (res, error, message = "Internal server error") => {
    console.error(error);
    res.status(500).json({ error: message });
};
// Send a friend request
const sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user?.id;
        console.log(req.user);
        // Parse IDs to numbers
        const parsedSenderId = senderId ? Number(senderId) : undefined;
        const parsedReceiverId = receiverId ? Number(receiverId) : undefined;
        if (!parsedSenderId ||
            !parsedReceiverId ||
            isNaN(parsedSenderId) ||
            isNaN(parsedReceiverId)) {
            return res.status(400).json({ error: "Invalid user IDs" });
        }
        const request = await db_config_1.default.friendRequests.create({
            data: { senderId: parsedSenderId, receiverId: parsedReceiverId, status: "PENDING" },
        });
        // Notify the recipient about the new friend request
        index_1.io.to(parsedReceiverId.toString()).emit("friend-request-received", {
            senderId: parsedSenderId,
            requestId: request.id,
            status: request.status,
        });
        return res.status(200).send({
            request,
        });
    }
    catch (error) {
        handleError(res, error);
    }
};
exports.sendFriendRequest = sendFriendRequest;
// Accept friend request
const acceptFriendRequest = async (req, res) => {
    try {
        const requestId = Number(req.params.id);
        const request = await db_config_1.default.friendRequests.update({
            where: { id: requestId },
            data: { status: "ACCEPTED" },
        });
        return res.status(200).send({
            request,
        });
    }
    catch (error) {
        handleError(res, error);
    }
};
exports.acceptFriendRequest = acceptFriendRequest;
// Reject friend request
const rejectFriendRequest = async (req, res) => {
    try {
        const requestId = Number(req.params.id);
        const request = await db_config_1.default.friendRequests.update({
            where: { id: requestId },
            data: { status: "REJECTED" },
        });
        return res.status(200).send({
            request,
        });
    }
    catch (error) {
        handleError(res, error);
    }
};
exports.rejectFriendRequest = rejectFriendRequest;
// Respond to friend requests accept or reject
const updateFriendRequestStatus = async (req, res) => {
    try {
        const requestId = Number(req.params.id);
        const { status } = req.body;
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const prismaStatus = status === "accepted"
            ? "ACCEPTED"
            : status === "rejected"
                ? "REJECTED"
                : undefined;
        if (!prismaStatus) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const updatedRequest = await db_config_1.default.friendRequests.update({
            where: { id: requestId },
            data: { status: prismaStatus },
        });
        // Notify the sender about the status update
        index_1.io.to(updatedRequest.senderId.toString()).emit("friend-request-status", {
            receiverId: updatedRequest.receiverId,
            status,
        });
        res.json(updatedRequest);
    }
    catch (error) {
        res.status(500).json({ error: "Unable to update friend request" });
    }
};
exports.updateFriendRequestStatus = updateFriendRequestStatus;
// List pending requests
const listPendingRequests = async (req, res) => {
    try {
        const senderId = req.user?.id;
        const parsedId = senderId ? Number(senderId) : undefined;
        const pendingRequests = await db_config_1.default.friendRequests.findMany({
            where: {
                receiverId: parsedId,
                status: "PENDING",
            },
        });
        return res.status(200).send({
            pendingRequests,
        });
    }
    catch (error) {
        handleError(res, error);
    }
};
exports.listPendingRequests = listPendingRequests;
// Get friends (all accepted requests involving the user)
const getFriends = async (req, res) => {
    try {
        const senderId = req.user?.id;
        const parsedId = senderId ? Number(senderId) : undefined;
        const friends = await db_config_1.default.friendRequests.findMany({
            where: {
                OR: [
                    { senderId: parsedId, status: "ACCEPTED" },
                    { receiverId: parsedId, status: "ACCEPTED" },
                ],
            },
        });
        return res.status(200).send({
            friends,
        });
    }
    catch (error) {
        handleError(res, error);
    }
};
exports.getFriends = getFriends;
