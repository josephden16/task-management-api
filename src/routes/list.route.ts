import {
  createList,
  deleteList,
  getAllLists,
  updateList,
  getList,
} from "@controllers/list.controller";
import { authMiddleware } from "@middlewares/auth";
import { Router } from "express";

const listRouter = Router();

listRouter.post("/", authMiddleware, createList);
listRouter.get("/", authMiddleware, getAllLists);
listRouter.get("/:id", authMiddleware, getList);
listRouter.put("/:id", authMiddleware, updateList);
listRouter.delete("/:id", authMiddleware, deleteList);

export default listRouter;
