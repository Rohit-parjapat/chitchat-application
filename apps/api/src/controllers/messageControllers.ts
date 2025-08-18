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
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1, // Get the last message in each conversation
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                profile: true,
                            }
                        }
                    }
                },
            },
        });

        return res.status(200).json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getChatMessages = async(req: UserRequest, res: Response) => {
    try {
        const { conversationId } = req.params;

        if (!conversationId) {
            return res.status(400).json({ message: "Bad Request" });
        }

        // Fetch messages for the specific conversation
        const messages = await prisma.messages.findMany({
            where: {
                conversationId: parseInt(conversationId),
            },
            orderBy: {
                createdAt: 'asc',
            },
            include: {
                sender: true, // Include sender details
            },
        });

        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const saveMessagesToDb = async(conversationId:number, senderId:number, content:string) => {
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
                    }
                }
            }
        });
        return message;
    } catch (error) {
        console.error("Error saving message:", error);
        throw new Error("Failed to save message");
    }
}

export const findOrCreateConversation = async (user1Id: number, user2Id: number) => {
    try {
        // First, try to find existing conversation between the two users
        const existingConversation = await prisma.conversations.findFirst({
            where: {
                isGroup: false,
                participants: {
                    every: {
                        userId: {
                            in: [user1Id, user2Id]
                        }
                    }
                }
            },
            include: {
                participants: true
            }
        });

        if (existingConversation && existingConversation.participants.length === 2) {
            return existingConversation;
        }

        // Create new conversation if none exists
        const newConversation = await prisma.conversations.create({
            data: {
                isGroup: false,
                participants: {
                    create: [
                        { userId: user1Id },
                        { userId: user2Id }
                    ]
                }
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
                            }
                        }
                    }
                }
            }
        });

        return newConversation;
    } catch (error) {
        console.error("Error finding/creating conversation:", error);
        throw new Error("Failed to find or create conversation");
    }
}