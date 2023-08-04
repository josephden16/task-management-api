import {
  createLabel,
  deleteLabel,
  getAllLabels,
  updateLabel,
} from "@controllers/label.controller";
import { authMiddleware } from "@middlewares/auth";
import { Router } from "express";

const labelRouter = Router();

labelRouter.post("/", authMiddleware, createLabel);
labelRouter.get("/", authMiddleware, getAllLabels);
labelRouter.delete("/:id", authMiddleware, deleteLabel);
labelRouter.put("/:id", authMiddleware, updateLabel);

export default labelRouter;
