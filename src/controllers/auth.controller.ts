import User from "@models/user.model";
import asyncHandler from "express-async-handler";
import vine, { errors } from "@vinejs/vine";
import { comparePasswords, generatePasswordHash } from "@utils/password";
import {
  createAccessToken,
  createRefreshToken,
  refreshTokenDurationInMs,
  validateRefreshToken,
} from "@utils/jwt";
import { createError } from "http-errors-enhanced";
import Token from "@models/token.model";

export const signUp = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const { email, password } = data;
  try {
    const schema = vine.object({
      name: vine.string(),
      email: vine.string().email(),
      password: vine.string().minLength(8).maxLength(32),
    });
    const output = await vine.validate({ schema, data });
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(
        createError(
          409,
          "The provided email address is already associated with an existing account."
        )
      );
    }
    const hashedPassword = await generatePasswordHash(password);
    const newUser = await User.create({
      ...output,
      password: hashedPassword,
    });
    const accessToken = await createAccessToken({
      id: newUser._id.toString() as string,
      email: newUser.email,
    });
    const refreshToken = await createRefreshToken({
      id: newUser._id.toString() as string,
      email: newUser.email,
    });
    await Token.create({
      user: newUser._id,
      token: refreshToken,
      expiresOn: new Date(Date.now() + refreshTokenDurationInMs),
    });
    res.status(201).json({
      status: "success",
      message: "Registration successful!",
      data: { refreshToken, accessToken },
    });
  } catch (error: any) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      res.status(400).json({
        status: "error",
        message: "Invalid sign up information",
        error: error.messages,
      });
    } else {
      // next(createError(400, "Sign up failed"));
      next(error);
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
        message:
          "Invalid credentials. Please check your email and password and try again.",
      });
    } else {
      const isValid = await comparePasswords(password, user.password);
      if (isValid) {
        const userData = await User.findOne({ email })
          .lean()
          .select("-password");

        if (userData?.blockedAt) {
          return next(
            createError(401, "Your account is temporarily disabled.")
          );
        }

        const accessToken = await createAccessToken({
          id: userData?._id.toString() as string,
          email: user.email,
        });
        const refreshToken = await createRefreshToken({
          id: userData?._id.toString() as string,
          email: user.email,
        });
        await Token.create({
          user: userData?._id,
          token: refreshToken,
          expiresOn: new Date(Date.now() + refreshTokenDurationInMs),
        });
        res.status(200).json({
          status: "success",
          message: "Login successful!",
          data: { accessToken, refreshToken },
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

export const refresh = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return next(createError(401, "Invalid refresh token"));

  try {
    const decoded = await validateRefreshToken(refreshToken);
    if (!decoded.id) {
      return next(createError(401, "Invalid refresh token."));
    }
    const user = await User.findById(decoded.id);
    const tokenFromDb = await Token.findOne({
      token: refreshToken,
      user: decoded.id,
    });
    if (tokenFromDb && user) {
      if (tokenFromDb.lastUsedAt) {
        // Token has been used which means it has likely been stolen from an attacker
        await Token.findByIdAndUpdate(tokenFromDb.id, {
          compromisedAt: new Date(),
        });
        // Block the user's account as a security measure
        await User.findByIdAndUpdate(user.id, {
          blockedAt: new Date(),
        });
        return next(createError(401, "Invalid refresh token."));
      }

      const hasExpired = new Date(tokenFromDb.expiresOn) < new Date();

      if (hasExpired) {
        return next(createError(401, "Invalid refresh token."));
      }

      const newAccessToken = await createAccessToken({
        id: user.id,
        email: user.email,
      });
      const newRefreshToken = await createRefreshToken({
        id: user.id,
        email: user.email,
      });
      await Token.create({
        user: user.id,
        token: newRefreshToken,
        expiresOn: new Date(Date.now() + refreshTokenDurationInMs),
      });
      await Token.findByIdAndUpdate(tokenFromDb.id, {
        lastUsedAt: new Date(),
        expiresOn: new Date(Date.now() - 1000),
      });
      res.json({
        status: "success",
        message: "Token refresh successful",
        data: {
          user: user,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } else {
      return next(createError(401, "Invalid refresh token."));
    }
  } catch (error) {
    return next(createError(401, "Invalid refresh token."));
  }
});
