import { default as mongoose } from "mongoose";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log(error);
    console.log("Database Connection Failed");
  }
};
