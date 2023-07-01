import mongoose from "mongoose";

const AdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    photo: {
      type: String,
    },
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Ad", AdSchema);
