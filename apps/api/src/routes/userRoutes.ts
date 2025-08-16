import express, { Router } from "express";
import { userRegister, userLogin, userLogout, refreshAccessToken } from "../controllers/authControllers";
import { sendFriendRequest, updateFriendRequestStatus, getFriends } from "../controllers/friendRequestControllers";
import { authenticateUser } from "../middlewares/authenticateUser";

const router:Router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.post("/refresh-token",authenticateUser, refreshAccessToken);

// Friend requests
router.post("/friend-requests", authenticateUser, sendFriendRequest);
router.patch("/friend-requests/:id", authenticateUser, updateFriendRequestStatus);
router.get("/friends", authenticateUser, getFriends);

export default router;