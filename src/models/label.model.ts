import mongoose from "mongoose"; // Erase if already required

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Label = mongoose.model("Label", labelSchema);

export default Label;
