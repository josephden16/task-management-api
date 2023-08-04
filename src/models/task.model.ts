import mongoose from "mongoose"; // Erase if already required

export const taskStatus = ["Done", "In Progress"];

export const taskPriority = [1, 2, 3, 4];

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    priority: {
      type: Number,
      enum: taskPriority,
      default: 4,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: taskStatus,
      default: "In Progress",
    },
    labels: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Label",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
