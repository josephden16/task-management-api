import User from "@models/user.model";
import asyncHandler from "express-async-handler";
import vine, { errors } from "@vinejs/vine";
import { comparePasswords, generatePasswordHash } from "@utils/password";
import { createJWT } from "@utils/jwt";
import { createError } from "http-errors-enhanced";

export const signUp = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const { email, password } = data;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      next(
        createError(
          409,
          "The provided email address is already associated with an existing account."
        )
      );
    }
    const schema = vine.object({
      name: vine.string(),
      email: vine.string().email(),
      password: vine.string().minLength(8).maxLength(32),
    });
    const output = await vine.validate({ schema, data });
    const hashedPassword = await generatePasswordHash(password);
    const newUser = await User.create({
      ...output,
      password: hashedPassword,
    });
    const token = await createJWT({
      id: newUser?._id.toString() as string,
      email: newUser.email,
    });
    res.status(201).json({
      status: "success",
      message: "Registration successful!",
      data: { token },
    });
  } catch (error: any) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      res.status(400).json({
        status: "error",
        message: "Invalid sign up information",
        error: error.messages,
      });
    } else {
      next(createError(400, "Sign up failed"));
    }
  }
});

export const login = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const { email, password } = data;
  try {
    const schema = vine.object({
      email: vine.string().email(),
      password: vine.string().minLength(8).maxLength(32),
    });
    await vine.validate({ schema, data });
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        status: "error",
        message: "No account exists with this email address",
      });
    } else {
      const isValid = await comparePasswords(password, user.password);
      const userData = await User.findOne({ email }).lean().select("-password");
      if (isValid) {
        const token = await createJWT({
          id: userData?._id.toString() as string,
          email: user.email,
        });
        res.status(200).json({
          status: "success",
          message: "Login successful!",
          data: { token },
        });
      } else {
        res.status(400).json({
          status: "error",
          message:
            "Invalid credentials. Please check your email and password and try again.",
        });
      }
    }
  } catch (error: any) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      res.status(400).json({
        status: "error",
        message: "Invalid login information",
        error: error.messages,
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Login failed",
      });
    }
  }
});
