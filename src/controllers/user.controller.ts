import User from "@models/user.model";
import { validateMongodbId } from "@utils/validations";
import asyncHandler from "express-async-handler";
import { createError } from "http-errors-enhanced";
import vine, { errors } from "@vinejs/vine";

export const getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  try {
    validateMongodbId(id);
    const user = await User.findById(id).select("-password");
    if (user) {
      res.json({
        status: "success",
        message: "User data retrieved",
        data: user,
      });
    } else {
      return next(createError(404, "User not found"));
    }
  } catch (error) {
    return next(error);
  }
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  if (!id) {
    return next(
      createError(
        400,
        "You must provide valid credentials to perform this operation"
      )
    );
  }
  try {
    validateMongodbId(id);
    const data = req.body;
    const schema = vine.object({
      name: vine.string().optional(),
    });
    const output = await vine.validate({ schema, data });
    const user = await User.findByIdAndUpdate(id, output, { new: true }).select(
      "-password"
    );
    if (user) {
      res.json({
        status: "success",
        message: "User profile updated",
        data: user,
      });
    } else {
      return next(createError(400, "Failed to update user profile"));
    }
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      res.status(400).json({
        status: "error",
        message: "Invalid information sent",
        error: error.messages,
      });
    }
    return next(createError(400, "Failed to update user profile"));
  }
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  if (!id) {
    return next(createError(400, "Id parameter is missing"));
  }
  try {
    validateMongodbId(id);
    const user = await User.findByIdAndDelete(id);
    console.log(user);
    if (user) {
      res.json({
        status: "success",
        message: "User account deleted",
      });
    } else {
      return next(createError(400, "Failed to delete user"));
    }
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      res.status(400).json({
        status: "error",
        message: "Invalid information sent",
        error: error.messages,
      });
    }
    return next(createError(400, "Failed to delete user"));
  }
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await User.find().limit(50);
    res.json({
      status: "success",
      message: "Retrieved all users",
      data: users,
    });
  } catch (error) {
    return next(createError(400, "Failed to get all users"));
  }
});
