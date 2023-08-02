import { createError } from "http-errors-enhanced";
import mongoose from "mongoose"; // Erase if already required

export const validateMongodbId = (id: string) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw createError(400, "Id parameter is invalid");
};
