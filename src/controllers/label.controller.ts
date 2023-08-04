import asyncHandler from "express-async-handler";
import vine, { errors } from "@vinejs/vine";
import { createError } from "http-errors-enhanced";
import Label from "@models/label.model";
import { validateMongodbId } from "@utils/validations";
import List from "@models/list.model";

export const createLabel = asyncHandler(async (req, res, next) => {
  const data = req.body;
  try {
    const schema = vine.object({
      name: vine.string().minLength(1).maxLength(300),
    });
    const output = await vine.validate({ schema, data });

    const foundLabel = await Label.findOne({ name: output.name });

    if (!foundLabel) {
      const newLabel = await Label.create({ ...output, owner: req.user.id });
      res.status(201).json({
        status: "success",
        message: "Label created",
        data: newLabel,
      });
    } else {
      return next(createError(400, "A label already exists with this name."));
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

export const getAllLabels = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.user;
    const labels = await Label.find({ owner: id });
    res.json({
      status: "success",
      message: "Labels retrieved",
      data: labels,
    });
  } catch (error) {
    next(createError(400, "Failed to get all labels"));
  }
});

export const deleteLabel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongodbId(id, "Invalid id parameter passed");

  try {
    const label = await Label.findById(id);
    if (label) {
      if (label.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to delete this label")
        );
      } else {
        await Label.findByIdAndDelete(id);
        res.json({
          status: "success",
          message: "Label deleted",
        });
      }
    } else {
      return next(createError(404, "This label does not exist"));
    }
  } catch (error) {
    return next(createError(400, "Failed to delete label"));
  }
});

export const updateLabel = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  validateMongodbId(id, "Invalid id parameter passed");
  try {
    const schema = vine.object({
      name: vine.string().minLength(1).maxLength(300),
    });
    const output = await vine.validate({ schema, data });
    const label = await Label.findById(id);
    if (label) {
      if (label.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to update this label")
        );
      } else {
        const updatedLabel = await Label.findByIdAndUpdate(id, output, {
          new: true,
        });
        res.json({
          status: "success",
          message: "Label updated",
          data: updatedLabel,
        });
      }
    } else {
      return next(createError(404, "This label does not exist"));
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
