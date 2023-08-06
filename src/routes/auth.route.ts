import {
  login,
  refresh,
  signUp,
  requestPasswordReset,
  resetPassword,
} from "@controllers/auth.controller";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/request-password-reset", requestPasswordReset);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
