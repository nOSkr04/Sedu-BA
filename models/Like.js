import mongoose from "mongoose";
const LikeSchema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    createUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
    name: {
      type: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export default mongoose.model("Like", LikeSchema);
