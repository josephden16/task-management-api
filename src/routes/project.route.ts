import {
  createProject,
  getAllProjects,
  getProject,
  deleteProject,
  updateProject,
} from "@controllers/project.controller";
import { authMiddleware } from "@middlewares/auth";
import { Router } from "express";

const projectRouter = Router();

projectRouter.post("/", authMiddleware, createProject);
projectRouter.get("/", authMiddleware, getAllProjects);
projectRouter.get("/:id", authMiddleware, getProject);
projectRouter.delete("/:id", authMiddleware, deleteProject);
projectRouter.put("/:id", authMiddleware, updateProject);

export default projectRouter;
