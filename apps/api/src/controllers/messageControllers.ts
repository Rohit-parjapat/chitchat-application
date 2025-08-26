import { Request, Response } from "express";
import prisma from "../config/db.config";

interface UserRequest extends Request {
  user?: {
    id: number;
  };
}

export const getConversationList = async (req: UserRequest, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming user ID is stored in req.user by authenticateUser middleware
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch conversations for the user with updated schema
    const conversations = await prisma.conversations.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get the last message in each conversation
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ conversations, currentUser: req.user });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getConversationById = async (req: UserRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "Conversation ID not provided" });
    }
    const conversationId = parseInt(req.params.id as string, 10);
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" });
    }

    const conversation = await prisma.conversations.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const getChatMessages = async (req: UserRequest, res: Response) => {
  try {
    const conversationId = req.params.id;
    console.log("Fetching chat messages for conversationId:", conversationId);

    if (!conversationId) {
      return res.status(400).json({ message: "Bad Request" });
    }

    // Fetch messages for the specific conversation
    const messages = await prisma.messages.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        }, // Include sender details
      },
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createNewConversation = async (
  req: UserRequest,
  res: Response
) => {
  try {
    const senderId = req.user?.id;
    const receiverId = req.body.receiverId;

    console.log("Creating new conversation between:", senderId, receiverId);
    console.log("Request Body:", req.body);

    const parsedSenderId =
      typeof senderId === "string" ? parseInt(senderId) : senderId;
    const parsedReceiverId =
      typeof receiverId === "string" ? parseInt(receiverId) : receiverId;

    console.log("Parsed IDs:", parsedSenderId, parsedReceiverId);

    if (
      parsedSenderId == null ||
      parsedReceiverId == null ||
      isNaN(parsedSenderId) ||
      isNaN(parsedReceiverId)
    ) {
      return res
        .status(400)
        .json({ message: "Sender or Receiver ID not provided." });
    }

    const conversation = await findOrCreateConversation(
      parsedSenderId,
      parsedReceiverId
    );
    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Error creating new conversation:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const saveMessagesToDb = async (
  conversationId: number,
  senderId: number,
  content: string
) => {
  try {
    const message = await prisma.messages.create({
      data: {
        conversationId,
        senderId,
        content,
        status: "SENT",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profile: true,
          },
        },
      },
    });
    return message;
  } catch (error) {
    console.error("Error saving message:", error);
    throw new Error("Failed to save message");
  }
};

export const findOrCreateConversation = async (
  senderId: number,
  receiverId: number
) => {
  try {
    // First, try to find existing conversation between the two users
    const existingConversation = await prisma.conversations.findFirst({
      where: {
        isGroup: false,
        participants: {
          every: {
            userId: {
              in: [senderId, receiverId],
            },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (
      existingConversation &&
      existingConversation.participants.length === 2
    ) {
      return existingConversation;
    }

    const sender = await prisma.users.findUnique({ where: { id: senderId } });
    const receiver = await prisma.users.findUnique({
      where: { id: receiverId },
    });

    if (!sender || !receiver) {
      throw new Error("One or both users do not exist");
    }

    // Create new conversation if none exists
    const newConversation = await prisma.conversations.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: sender.id, role: "ADMIN" },
            { userId: receiver.id, role: "MEMBER" },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: true,
              },
            },
          },
        },
      },
    });

    return newConversation;
  } catch (error) {
    console.error("Error finding/creating conversation:", error);
    throw new Error("Failed to find or create conversation");
  }
};
