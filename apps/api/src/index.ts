import express, {Request, Response} from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimiter from "express-rate-limit";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoutes"
import friendRequestRoutes from "./routes/friendRequestRoutes";

const app = express();

// middlewares
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true // Allow credentials (cookies) to be sent
}));
app.use(helmet());
app.use(rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100 
}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

const PORT = process.env.PORT || 5000;
app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: "API is healthy"
    });
});

app.use("/api/users", userRoute);
app.use("/api/friends", friendRequestRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});