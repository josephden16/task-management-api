import express, { Express, json, urlencoded } from "express";
import "express-async-errors";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import { connectDatabase } from "@config/connectDatabase";
import { errorHandler, notFound } from "@middlewares/errorHandler";
import { apiStatusHandler } from "@utils/handlers";
import authRouter from "@routes/auth.route";
import userRouter from "@routes/user.route";
import taskRouter from "@routes/task.route";
import listRouter from "@routes/list.route";
import labelRouter from "@routes/label.route";
import projectRouter from "@routes/project.route";

// Setup
dotenv.config();
const port = process.env.PORT;
const app: Express = express();

// Connect Database
connectDatabase();

// Express specific setup
app.set("trust proxy", true);

// Middlewares
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Routes
app.get("/status", apiStatusHandler);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/task", taskRouter);
app.use("/api/list", listRouter);
app.use("/api/label", labelRouter);
app.use("/api/project", projectRouter);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
