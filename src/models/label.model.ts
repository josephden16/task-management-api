import mongoose from "mongoose"; // Erase if already required

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Label = mongoose.model("Label", labelSchema);

export default Label;
