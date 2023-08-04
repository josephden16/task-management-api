import { Router } from "express";
import {
  addTaskLabel,
  createTask,
  deleteTask,
  getAllTasks,
  getTask,
  updateTask,
  removeTaskLabel,
} from "@controllers/task.controller";
import { authMiddleware } from "@middlewares/auth";

const taskRouter = Router();

taskRouter.post("/", authMiddleware, createTask);
taskRouter.get("/", authMiddleware, getAllTasks);
taskRouter.put("/add-label", authMiddleware, addTaskLabel);
taskRouter.put("/remove-label", authMiddleware, removeTaskLabel);
taskRouter.get("/:id", authMiddleware, getTask);
taskRouter.put("/:id", authMiddleware, updateTask);
taskRouter.delete("/:id", authMiddleware, deleteTask);

export default taskRouter;
