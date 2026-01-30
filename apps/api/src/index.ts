import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";
import commentsRouter from "./routes/comments.js";
import profilesRouter from "./routes/profiles.js";

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/posts", postsRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/profiles", profilesRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
