"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authControllers_1 = require("../controllers/authControllers");
const friendRequestControllers_1 = require("../controllers/friendRequestControllers");
const authenticateUser_1 = require("../middlewares/authenticateUser");
const router = express_1.default.Router();
router.post("/register", authControllers_1.userRegister);
router.post("/login", authControllers_1.userLogin);
router.post("/logout", authControllers_1.userLogout);
router.post("/refresh-token", authenticateUser_1.authenticateUser, authControllers_1.refreshAccessToken);
// Friend requests
router.post("/friend-requests", authenticateUser_1.authenticateUser, friendRequestControllers_1.sendFriendRequest);
router.patch("/friend-requests/:id", authenticateUser_1.authenticateUser, friendRequestControllers_1.updateFriendRequestStatus);
router.get("/friends", authenticateUser_1.authenticateUser, friendRequestControllers_1.getFriends);
exports.default = router;
