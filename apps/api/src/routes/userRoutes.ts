import express, { Router } from "express";
import { userRegister, userLogin, userLogout, refreshAccessToken, getAllUsers } from "../controllers/authControllers";
import { authenticateUser } from "../middlewares/authenticateUser";

const router:Router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.post("/refresh-token",authenticateUser, refreshAccessToken);
router.get("/", authenticateUser,getAllUsers);

export default router;