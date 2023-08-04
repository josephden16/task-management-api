import vine, { VineString } from "@vinejs/vine";
import { createError } from "http-errors-enhanced";
import mongoose from "mongoose";

declare module "@vinejs/vine" {
  interface VineString {
    dueDate(): this;
    mongodbId(): this;
  }
}

function mongodbId(value: unknown, options: any, field: any) {
  if (typeof value !== "string") {
    return;
  }

  const notValid = !mongoose.Types.ObjectId.isValid(value);

  if (notValid) {
    field.report("The {{ field }} field is not valid", "mongodbId", field);
  }
}

function dueDate(value: unknown, options: any, field: any) {
  if (typeof value !== "string") {
    return;
  }

  const dueDateTime = new Date(value);
  const now = new Date();

  if (dueDateTime < now) {
    field.report("The {{ field }} field is not valid", "dueDate", field);
  }
}

export const dueDateRule = vine.createRule(dueDate);
export const mongodbIdRule = vine.createRule(mongodbId);

export const validateMongodbId = (id: string, errorMessage?: string) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw createError(400, errorMessage || "Invalid data passed");
};

VineString.macro("dueDate", function (this: VineString) {
  return this.use(dueDateRule());
});

VineString.macro("mongodbId", function (this: VineString) {
  return this.use(mongodbIdRule());
});
