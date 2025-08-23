"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.userLogout = exports.getAllUsers = exports.userLogin = exports.userRegister = void 0;
const validators_1 = require("../middlewares/validators");
const joi_1 = require("joi");
const db_config_1 = __importDefault(require("../config/db.config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Register function to create a new user
const userRegister = async (req, res) => {
    try {
        const body = req.body;
        const payload = await validators_1.userRegisterValidator.validateAsync(body, { presence: "required" });
        const findUser = await db_config_1.default.users.findUnique({
            where: {
                email: payload.email
            }
        });
        if (findUser) {
            return res.status(400).send({
                error: {
                    email: "Email already exist. Please use another Email."
                }
            });
        }
        payload.password = await bcrypt_1.default.hash(payload.password, 10);
        const user = await db_config_1.default.users.create({
            data: payload
        });
        return res.status(200).send({
            message: "user created Successfully",
            user
        });
    }
    catch (error) {
        if (error instanceof joi_1.ValidationError) {
            return res.status(400).send({
                message: error.message
            });
        }
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
exports.userRegister = userRegister;
// Login function to authenticate user
const userLogin = async (req, res) => {
    try {
        const body = req.body;
        const { email, password } = await validators_1.userLoginValidator.validateAsync(body, { presence: "required" });
        if (req.cookies.refreshToken) {
            const existingRefreshToken = req.cookies.refreshToken;
            if (!process.env.REFRESH_TOKEN_SECRET) {
                return res.status(500).json({
                    message: "REFRESH_TOKEN_SECRET is not configured"
                });
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(existingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
                const existingUser = await db_config_1.default.users.findUnique({
                    where: { id: decoded.id }
                });
                if (existingUser && existingUser.refreshToken === existingRefreshToken) {
                    return res.status(400).json({
                        message: "User already logged in"
                    });
                }
            }
            catch (err) {
                // Ignore invalid token, proceed with login
            }
        }
        const user = await db_config_1.default.users.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            return res.status(400).send({
                error: {
                    email: "User not found."
                }
            });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(400).send({
                error: {
                    password: "Invalid Credentials!."
                }
            });
        }
        try {
            const accessToken = generateAccessToken(user.id, user.name, user.email);
            const refreshToken = generateRefreshToken(user.id);
            await db_config_1.default.users.update({
                where: { id: user.id },
                data: { refreshToken }
            });
            // Set cookies using utility function
            res.cookie('accessToken', accessToken, getCookieOptions(1)); // 1 day
            res.cookie('refreshToken', refreshToken, getCookieOptions(7)); // 7 days
            return res.status(200).send({
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    profile: user.profile
                },
                accessToken, // Also send in response body for client-side usage if needed
                refreshToken
            });
        }
        catch (tokenError) {
            return res.status(500).json({
                message: "Failed to generate token"
            });
        }
    }
    catch (error) {
        if (error instanceof joi_1.ValidationError) {
            return res.status(400).send({
                message: error.message
            });
        }
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
exports.userLogin = userLogin;
// Get all Users
const getAllUsers = async (req, res) => {
    try {
        const users = await db_config_1.default.users.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                profile: true
            }
        });
        return res.status(200).json(users);
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
exports.getAllUsers = getAllUsers;
// Logout function to clear cookies
const userLogout = async (req, res) => {
    try {
        if (req.cookies.refreshToken) {
            const decoded = jsonwebtoken_1.default.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await db_config_1.default.users.update({
                where: { id: decoded.id },
                data: { refreshToken: null }
            });
        }
        // Clear cookies by setting them with past expiration
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({
            message: "Logged out successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};
exports.userLogout = userLogout;
// Function to refresh access token using refresh token
const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        return res.status(401).json({
            message: "Unauthorized request"
        });
    }
    if (!process.env.REFRESH_TOKEN_SECRET) {
        return res.status(500).json({
            message: "REFRESH_TOKEN_SECRET is not configured"
        });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        // Get user from database
        const user = await db_config_1.default.users.findUnique({
            where: { id: decodedToken.id }
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({
                message: "Refresh token is expired or used"
            });
        }
        const newAccessToken = generateAccessToken(user.id, user.name, user.email);
        const newRefreshToken = generateRefreshToken(user.id);
        await db_config_1.default.users.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken }
        });
        // Set new access token in cookie
        res.cookie('accessToken', newAccessToken, getCookieOptions(1));
        res.cookie('refreshToken', newRefreshToken, getCookieOptions(7));
        return res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid refresh token"
        });
    }
};
exports.refreshAccessToken = refreshAccessToken;
// Utility function to generate access token
const generateAccessToken = (userId, userName, email) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is not configured");
    }
    return jsonwebtoken_1.default.sign({
        id: userId,
        email: email
    }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
};
// Utility function to generate refresh token
const generateRefreshToken = (userId) => {
    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error("REFRESH_TOKEN_SECRET is not configured");
    }
    return jsonwebtoken_1.default.sign({
        id: userId
    }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};
// Cookie configuration utility
const getCookieOptions = (maxAgeInDays = 1) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: maxAgeInDays * 24 * 60 * 60 * 1000
});
