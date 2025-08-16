import { Request, Response } from "express";
import prisma from "../config/db.config";

// Authenticated request interface
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
    };
}

// Server error handler
const handleError = (res: Response, error: any, message = "Internal server error") => {
    console.error(error);
    res.status(500).json({ error: message });
};

// Send a friend request
export const sendFriendRequest = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { toId } = req.body;
        const fromId = req.user?.id;
        console.log(req.user)

        // Parse IDs to numbers
        const parsedFromId = fromId ? Number(fromId) : undefined;
        const parsedToId = toId ? Number(toId) : undefined;

        if (
            !parsedFromId ||
            !parsedToId ||
            isNaN(parsedFromId) ||
            isNaN(parsedToId)
        ) {
            return res.status(400).json({ error: "Invalid user IDs" });
        }

        const request = await prisma.friendRequests.create({
            data: { fromId: parsedFromId, toId: parsedToId, status: "PENDING" },
        });
        return res.status(200).send({
            request,
        });
    } catch (error) {
        handleError(res, error);
    }
};

// Accept friend request
export const acceptFriendRequest = async (req: Request, res: Response) => {
    try {
        const requestId = Number(req.params.id);
        const request = await prisma.friendRequests.update({
            where: { id: requestId },
            data: { status: "ACCEPTED" },
        });
        return res.status(200).send({
            request,
        });
    } catch (error) {
        handleError(res, error);
    }
};

// Reject friend request
export const rejectFriendRequest = async (req: Request, res: Response) => {
    try {
        const requestId = Number(req.params.id);
        const request = await prisma.friendRequests.update({
            where: { id: requestId },
            data: { status: "REJECTED" },
        });
        return res.status(200).send({
            request,
        });
    } catch (error) {
        handleError(res, error);
    }
};

// Respond to friend requests accept or reject
export const updateFriendRequestStatus = async (req: Request, res: Response) => {
    try {
        const requestId = Number(req.params.id);
        const { status } = req.body;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const prismaStatus =
            status === "accepted" ? "ACCEPTED" : status === "rejected" ? "REJECTED" : undefined;
        if (!prismaStatus) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const updatedRequest = await prisma.friendRequests.update({
            where: { id: requestId },
            data: { status: prismaStatus },
        });
        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: "Unable to update friend request" });
    }
}

// List pending requests
export const listPendingRequests = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const parsedId = userId ? Number(userId) : undefined;
        const pendingRequests = await prisma.friendRequests.findMany({
            where: {
                toId: parsedId,
                status: "PENDING"
            }
        });
        return res.status(200).send({
            pendingRequests
        });
    } catch (error) {
        handleError(res, error);
    }
};

// Get friends (all accepted requests involving the user)
export const getFriends = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const parsedId = userId ? Number(userId) : undefined;
        const friends = await prisma.friendRequests.findMany({
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
    } catch (error) {
        handleError(res, error);
    }
}
