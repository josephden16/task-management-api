import express, { Express, Request, Response, json, urlencoded } from "express";
import "express-async-errors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDatabase } from "@config/connectDatabase";
import { errorHandler, notFound } from "@middlewares/errorHandler";
import { apiStatusHandler } from "@utils/handlers";
import authRouter from "@routes/auth.route";
import userRouter from "@routes/user.route";

// Setup
dotenv.config();
const port = process.env.PORT;
const app: Express = express();

// Connect Database
connectDatabase();

// Middlewares
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.get("/status", apiStatusHandler);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
