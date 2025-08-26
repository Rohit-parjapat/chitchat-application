import { Request, Response } from "express";
import prisma from "../config/db.config";
import { io } from "../index";
// Authenticated request interface
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

// Server error handler
const handleError = (
  res: Response,
  error: any,
  message = "Internal server error"
) => {
  console.error(error);
  res.status(500).json({ error: message });
};

// Send a friend request
export const sendFriendRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user?.id;
    console.log(req.user);

    // Parse IDs to numbers
    const parsedSenderId = senderId ? Number(senderId) : undefined;
    const parsedReceiverId = receiverId ? Number(receiverId) : undefined;

    if (
      !parsedSenderId ||
      !parsedReceiverId ||
      isNaN(parsedSenderId) ||
      isNaN(parsedReceiverId)
    ) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    const request = await prisma.friendRequests.create({
      data: { senderId: parsedSenderId, receiverId: parsedReceiverId, status: "PENDING" },
    });

    // Notify the recipient about the new friend request
    io.to(parsedReceiverId.toString()).emit("friend-request-received", {
      senderId: parsedSenderId,
      requestId: request.id,
      status: request.status,
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
export const updateFriendRequestStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const prismaStatus =
      status === "accepted"
        ? "ACCEPTED"
        : status === "rejected"
          ? "REJECTED"
          : undefined;
    if (!prismaStatus) {
      return res.status(400).json({ error: "Invalid status" });
    }

    if(prismaStatus === "ACCEPTED"){
      try {
        const friendRequest = await prisma.friendRequests.findUnique({ where: { id: requestId } });
        if(!friendRequest) {
          return res.status(404).json({ error: "Request not found" });
        }
        // Parse IDs to numbers
    const parsedSenderId = friendRequest.senderId ? Number(friendRequest.senderId) : undefined;
    const parsedReceiverId = friendRequest.receiverId ? Number(friendRequest.receiverId) : undefined;

    if (
      !parsedSenderId ||
      !parsedReceiverId ||
      isNaN(parsedSenderId) ||
      isNaN(parsedReceiverId)
    ) {
      return res.status(400).json({ error: "Invalid user IDs" });
    }

    await prisma.friendRequests.create({
      data: { senderId: parsedReceiverId, receiverId: parsedSenderId, status: "ACCEPTED" },
    });
      } catch (error) {
        return res.status(500).json({ error: "Unable to create reciprocal friend request" });
      }
    }else{
      // If rejected, no need to create reciprocal request
    }

    const updatedRequest = await prisma.friendRequests.update({
      where: { id: requestId },
      data: { status: prismaStatus },
    });

    // Notify the sender about the status update
    io.to(updatedRequest.senderId.toString()).emit("friend-request-status", {
      receiverId: updatedRequest.receiverId,
      status,
    });
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: "Unable to update friend request" });
  }
};

// List pending requests
export const listPendingRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const senderId = req.user?.id;
    const parsedId = senderId ? Number(senderId) : undefined;
    const pendingRequests = await prisma.friendRequests.findMany({
      where: {
        receiverId: parsedId,
        status: {
          in: ["PENDING", "REJECTED"],
        },
      },
      include:{
        from: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        to: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
      }
    });
    return res.status(200).send({
      pendingRequests,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get friends (all accepted requests involving the user)
export const getFriends = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const senderId = req.user?.id;
    const parsedId = senderId ? Number(senderId) : undefined;
    const friends = await prisma.friendRequests.findMany({
      where: {
       senderId: parsedId,
       status: "ACCEPTED"
      },
      include:{
        from: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        to: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
      }
    });
    return res.status(200).send({
      friends,
    });
  } catch (error) {
    handleError(res, error);
  }
};
