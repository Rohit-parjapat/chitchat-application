import express, { Router } from "express";
import { authenticateUser } from "../middlewares/authenticateUser";
import { getConversationList, getChatMessages } from "../controllers/messageControllers";

const router:Router = express.Router();

router.get("/conversations", authenticateUser, getConversationList);
router.get("/conversations/:id/messages", authenticateUser, getChatMessages);


export default router;