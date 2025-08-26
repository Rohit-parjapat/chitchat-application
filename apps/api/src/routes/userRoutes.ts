import express, { Router } from "express";
import { userRegister, userLogin, userLogout, refreshAccessToken, getAllUsers, getLoggedUser } from "../controllers/authControllers";
import { authenticateUser, authenticateRefreshToken } from "../middlewares/authenticateUser";

const router:Router = express.Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.post("/refresh-token", authenticateRefreshToken, refreshAccessToken);
router.get("/", authenticateUser, getAllUsers);
router.get("/me", authenticateUser, getLoggedUser);

export default router;