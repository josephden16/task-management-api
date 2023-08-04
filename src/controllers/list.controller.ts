import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import vine, { errors } from "@vinejs/vine";
import List from "@models/list.model";
import { createError } from "http-errors-enhanced";
import { validateMongodbId } from "@utils/validations";
import Project from "@models/project.model";

export const createList = asyncHandler(async (req, res, next) => {
  const data = req.body;
  try {
    const schema = vine.object({
      name: vine.string().maxLength(100),
      project: vine.string().mongodbId(),
    });
    const output = await vine.validate({ schema, data });
    const newList = await List.create({ ...output, owner: req.user.id });
    await Project.findByIdAndUpdate(output.project, {
      $addToSet: { lists: newList.id },
    });
    res.status(201).json({
      status: "success",
      message: "List created",
      data: newList,
    });
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      res.status(400).json({
        status: "error",
        message: "Invalid information sent",
        error: error.messages,
      });
    }
    return next(error);
  }
});

export const getAllLists = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  try {
    const lists = await List.find({
      owner: new mongoose.Types.ObjectId(id),
    }).populate("tasks");
    res.json({
      status: "success",
      message: "Lists retrieved",
      data: lists,
    });
  } catch (error) {
    return next(createError(400, "Failed to get all lists"));
  }
});

export const getList = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongodbId(id, "Invalid id parameter passed");
  try {
    const list = await List.findById(id).populate("tasks");
    if (list) {
      if (list.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to access this list")
        );
      } else {
        res.json({
          status: "success",
          message: "List retrieved",
          data: list,
        });
      }
    } else {
      return next(createError(404, "This list does not exist"));
    }
  } catch (error) {
    return next(createError(400, "Failed to retrieve list"));
  }
});

export const updateList = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  validateMongodbId(id, "Invalid id parameter passed");
  try {
    const schema = vine.object({
      name: vine.string().maxLength(100),
    });
    const output = await vine.validate({ schema, data });
    const list = await List.findById(id);
    if (list) {
      if (list.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to update this list")
        );
      } else {
        const updatedList = await List.findByIdAndUpdate(id, output, {
          new: true,
        });
        res.json({
          status: "success",
          message: "List updated",
          data: updatedList,
        });
      }
    } else {
      return next(createError(404, "This list does not exist"));
    }
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      res.status(400).json({
        status: "error",
        message: "Invalid information sent",
        error: error.messages,
      });
    }
    return next(error);
  }
});

export const deleteList = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongodbId(id, "Invalid id parameter passed");
  try {
    const list = await List.findById(id);
    if (list) {
      if (list.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to delete this list")
        );
      } else {
        await List.findByIdAndDelete(id);
        res.json({
          status: "success",
          message: "List deleted",
        });
      }
    } else {
      return next(createError(404, "This list does not exist"));
    }
  } catch (error) {
    return next(createError(400, "Failed to delete list"));
  }
});
