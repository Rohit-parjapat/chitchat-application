"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFriends = exports.listPendingRequests = exports.updateFriendRequestStatus = exports.rejectFriendRequest = exports.acceptFriendRequest = exports.sendFriendRequest = void 0;
const db_config_1 = __importDefault(require("../config/db.config"));
// Server error handler
const handleError = (res, error, message = "Internal server error") => {
    console.error(error);
    res.status(500).json({ error: message });
};
// Send a friend request
const sendFriendRequest = async (req, res) => {
    try {
        const { toId } = req.body;
        const fromId = req.user?.id;
        console.log(req.user);
        // Parse IDs to numbers
        const parsedFromId = fromId ? Number(fromId) : undefined;
        const parsedToId = toId ? Number(toId) : undefined;
        if (!parsedFromId ||
            !parsedToId ||
            isNaN(parsedFromId) ||
            isNaN(parsedToId)) {
            return res.status(400).json({ error: "Invalid user IDs" });
        }
        const request = await db_config_1.default.friendRequests.create({
            data: { fromId: parsedFromId, toId: parsedToId, status: "PENDING" },
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
        const prismaStatus = status === "accepted" ? "ACCEPTED" : status === "rejected" ? "REJECTED" : undefined;
        if (!prismaStatus) {
            return res.status(400).json({ error: "Invalid status" });
        }
        const updatedRequest = await db_config_1.default.friendRequests.update({
            where: { id: requestId },
            data: { status: prismaStatus },
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
        const userId = req.user?.id;
        const parsedId = userId ? Number(userId) : undefined;
        const pendingRequests = await db_config_1.default.friendRequests.findMany({
            where: {
                toId: parsedId,
                status: "PENDING"
            }
        });
        return res.status(200).send({
            pendingRequests
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
        const userId = req.user?.id;
        const parsedId = userId ? Number(userId) : undefined;
        const friends = await db_config_1.default.friendRequests.findMany({
            where: {
                OR: [
                    { fromId: parsedId, status: "ACCEPTED" },
                    { toId: parsedId, status: "ACCEPTED" },
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
