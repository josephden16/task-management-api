import { validateJWT } from "@utils/jwt";
import asyncHandler from "express-async-handler";
import { createError } from "http-errors-enhanced";
import User from "@models/user.model";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = await validateJWT(token);
      const user = await User.findById(decoded?.id);
      if (user) {
        req.user = user;
        next();
      } else {
        next(
          createError(
            401,
            "You must provide valid credentials to access this resource."
          )
        );
      }
    } catch (error) {
      throw createError(
        401,
        "You must provide valid credentials to access this resource."
      );
    }
  } else {
    throw createError(400, "There is no token attached to the header");
  }
});
