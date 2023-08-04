import mongoose from "mongoose";
import { validateMongodbId } from "@utils/validations";
import asyncHandler from "express-async-handler";
import vine, { errors } from "@vinejs/vine";
import Task, { taskPriority, taskStatus } from "@models/task.model";
import { createError } from "http-errors-enhanced";
import List from "@models/list.model";
import Label from "@models/label.model";

export const createTask = asyncHandler(async (req, res, next) => {
  const data = req.body;
  try {
    const schema = vine.object({
      name: vine.string(),
      list: vine.string().mongodbId(),
      description: vine.string().maxLength(20000).optional(),
      priority: vine.enum(taskPriority).optional(),
      dueDate: vine.string().dueDate().optional(),
      status: vine.enum(taskStatus).optional(),
    });
    const output = await vine.validate({ schema, data });

    const taskList = await List.findById(output.list);

    if (taskList) {
      if (taskList.owner.toString() === req.user.id) {
        const newTask = await Task.create({ ...output, owner: req.user.id });
        await List.findByIdAndUpdate(taskList.id, {
          $addToSet: { tasks: newTask.id },
        });
        res.status(201).json({
          status: "success",
          message: "Task created",
          data: newTask,
        });
      } else {
        return next(
          createError(
            403,
            "You're not authorized to create a task on this list"
          )
        );
      }
    } else {
      return next(
        createError(400, "You can't add a task to a list that doesn't exist")
      );
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

export const getAllTasks = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  try {
    const tasks = await Task.find({
      owner: new mongoose.Types.ObjectId(id),
    });
    res.json({
      status: "success",
      message: "Tasks retrieved",
      data: tasks,
    });
  } catch (error) {
    return next(createError(400, "Failed to get all tasks"));
  }
});

export const getTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongodbId(id, "Invalid id parameter passed");
  try {
    const task = await Task.findById(id);
    if (task) {
      if (task.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to access this task")
        );
      } else {
        res.json({
          status: "success",
          message: "Task retrieved",
          data: task,
        });
      }
    } else {
      return next(createError(404, "This task does not exist"));
    }
  } catch (error) {
    return next(createError(400, "Failed to retrieve task"));
  }
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  validateMongodbId(id, "Invalid id parameter passed");
  try {
    const schema = vine.object({
      name: vine.string().optional(),
      description: vine.string().maxLength(20000).optional(),
      priority: vine.enum(taskPriority).optional(),
      dueDate: vine.string().dueDate().optional(),
      status: vine.enum(taskStatus).optional(),
    });
    const output = await vine.validate({ schema, data });
    const task = await Task.findById(id);
    if (task) {
      if (task.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to update this task")
        );
      } else {
        const updatedTask = await Task.findByIdAndUpdate(id, output, {
          new: true,
        });
        res.json({
          status: "success",
          message: "Task updated",
          data: updatedTask,
        });
      }
    } else {
      return next(createError(404, "This task does not exist"));
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

export const deleteTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongodbId(id, "Invalid id parameter passed");
  try {
    const task = await Task.findById(id);
    if (task) {
      if (task.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to delete this task")
        );
      } else {
        await Task.findByIdAndDelete(id);
        await List.findByIdAndUpdate(task.list, {
          $pull: { tasks: id },
        });
        res.json({
          status: "success",
          message: "Task deleted",
        });
      }
    } else {
      return next(createError(404, "This task does not exist"));
    }
  } catch (error) {
    return next(createError(400, "Failed to delete task"));
  }
});

export const addTaskLabel = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const { label, task } = data;

  try {
    const schema = vine.object({
      task: vine.string().mongodbId(),
      label: vine.string().mongodbId(),
    });
    await vine.validate({ schema, data });
    const chosenTask = await Task.findById(task);
    const chosenLabel = await Label.findById(label);
    if (chosenTask) {
      if (chosenTask.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to update this task")
        );
      } else {
        if (chosenLabel) {
          const updatedTask = await Task.findByIdAndUpdate(
            task,
            {
              $addToSet: {
                labels: chosenLabel.id,
              },
            },
            {
              new: true,
            }
          ).populate("labels");
          res.json({
            status: "success",
            message: "Label added to task",
            data: updatedTask,
          });
        } else {
          return next(createError(400, "This label does not exist"));
        }
      }
    } else {
      return next(createError(404, "This task does not exist"));
    }
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      res.status(400).json({
        status: "error",
        message: "Invalid information sent",
        error: error.messages,
      });
    }
    next(createError(400, "Failed to add label to task"));
  }
});

export const removeTaskLabel = asyncHandler(async (req, res, next) => {
  const data = req.body;
  const { label, task } = data;

  try {
    const schema = vine.object({
      task: vine.string().mongodbId(),
      label: vine.string().mongodbId(),
    });
    await vine.validate({ schema, data });
    const chosenTask = await Task.findById(task);
    const chosenLabel = await Label.findById(label);
    if (chosenTask) {
      if (chosenTask.owner.toString() !== req.user.id) {
        return next(
          createError(403, "You're not authorized to update this task")
        );
      } else {
        if (chosenLabel) {
          const updatedTask = await Task.findByIdAndUpdate(
            task,
            {
              $pull: {
                labels: chosenLabel.id,
              },
            },
            {
              new: true,
            }
          ).populate("labels");
          res.json({
            status: "success",
            message: "Label removed from task",
            data: updatedTask,
          });
        } else {
          return next(createError(400, "This label does not exist"));
        }
      }
    } else {
      return next(createError(404, "This task does not exist"));
    }
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      res.status(400).json({
        status: "error",
        message: "Invalid information sent",
        error: error.messages,
      });
    }
    next(createError(400, "Failed to remove label from task"));
  }
});
