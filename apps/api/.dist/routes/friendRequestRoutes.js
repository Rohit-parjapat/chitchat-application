"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const friendRequestControllers_1 = require("../controllers/friendRequestControllers");
const authenticateUser_1 = require("../middlewares/authenticateUser");
const router = express_1.default.Router();
// Friend requests
router.post("/request", authenticateUser_1.authenticateUser, friendRequestControllers_1.sendFriendRequest);
router.get("/requests", authenticateUser_1.authenticateUser, friendRequestControllers_1.listPendingRequests);
router.patch("/requests/:id/respond", authenticateUser_1.authenticateUser, friendRequestControllers_1.updateFriendRequestStatus);
router.get("/", authenticateUser_1.authenticateUser, friendRequestControllers_1.getFriends);
exports.default = router;
