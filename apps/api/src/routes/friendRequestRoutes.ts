import express, { Router } from "express";
import { sendFriendRequest, updateFriendRequestStatus, getFriends, listPendingRequests } from "../controllers/friendRequestControllers";
import { authenticateUser } from "../middlewares/authenticateUser";

const router:Router = express.Router();

// Friend requests
router.post("/request", authenticateUser, sendFriendRequest);
router.get("/requests", authenticateUser, listPendingRequests);
router.patch("/requests/:id/respond", authenticateUser, updateFriendRequestStatus);
router.get("/", authenticateUser, getFriends);

export default router;