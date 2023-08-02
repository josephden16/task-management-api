import { authMiddleware } from "@middlewares/auth";
import {
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
} from "@controllers/user.controller";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/", authMiddleware, getUser);
userRouter.put("/", authMiddleware, updateUser);
userRouter.delete("/", authMiddleware, deleteUser);
userRouter.get("/all", authMiddleware, getAllUsers);

export default userRouter;
