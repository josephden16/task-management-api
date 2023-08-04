import asyncHandler from "express-async-handler";
import vine, { errors } from "@vinejs/vine";
import { createError } from "http-errors-enhanced";
import Project from "@models/project.model";
import { validateMongodbId } from "@utils/validations";

export const createProject = asyncHandler(async (req, res, next) => {
  const data = req.body;
  try {
    const schema = vine.object({
      name: vine.string().maxLength(100),
    });
    const output = await vine.validate({ schema, data });
    const newProject = await Project.create({ ...output, owner: req.user.id });
    res.status(201).json({
      status: "success",
      message: "Project created",
      data: newProject,
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

export const getAllProjects = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  try {
    const Projects = await Project.find({
      owner: id,
    });
    res.json({
      status: "success",
      message: "Projects retrieved",
      data: Projects,
    });
  } catch (error) {
    return next(createError(400, "Failed to get all projects"));
  }
});

export const getProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongodbId(id, "Invalid id parameter passed");
  try {
    const project = await Project.findById(id).populate("lists");
    if (project) {
      if (project.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to access this project")
        );
      } else {
        res.json({
          status: "success",
          message: "Project retrieved",
          data: project,
        });
      }
    } else {
      return next(createError(404, "This project does not exist"));
    }
  } catch (error) {
    return next(createError(400, "Failed to retrieve project"));
  }
});

export const deleteProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongodbId(id, "Invalid id parameter passed");
  try {
    const project = await Project.findById(id);
    if (project) {
      if (project.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to delete this project")
        );
      } else {
        await Project.findByIdAndDelete(id);
        res.json({
          status: "success",
          message: "Project deleted",
        });
      }
    } else {
      return next(createError(404, "This project does not exist"));
    }
  } catch (error) {
    return next(createError(400, "Failed to delete project"));
  }
});

export const updateProject = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  validateMongodbId(id, "Invalid id parameter passed");
  try {
    const schema = vine.object({
      name: vine.string().maxLength(100),
    });
    const output = await vine.validate({ schema, data });
    const project = await Project.findById(id);
    if (project) {
      if (project.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to update this project")
        );
      } else {
        const updatedProject = await Project.findByIdAndUpdate(id, output, {
          new: true,
        });
        res.json({
          status: "success",
          message: "Project updated",
          data: updatedProject,
        });
      }
    } else {
      return next(createError(404, "This project does not exist"));
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
