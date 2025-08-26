import express, { Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { getConversationList, getChatMessages, createNewConversation, getConversationById,  } from "../controllers/messageControllers";

const router:Router = express.Router();

router.get("/conversations", authenticateUser, getConversationList);
router.get("/conversations/:id/messages", authenticateUser, getChatMessages);
router.post("/conversation/new", authenticateUser, createNewConversation);
router.get("/conversations/:id", authenticateUser, getConversationById);


export default router;