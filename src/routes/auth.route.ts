import { login, refresh, signUp } from "@controllers/auth.controller";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);

export default authRouter;
