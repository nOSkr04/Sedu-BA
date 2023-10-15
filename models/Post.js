import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: [true, "Ажил олгогчийн нэрийг оруулна уу"]
  },
  body: {
    type: String,
    // required: [true, "Тайлбар оруулна уу"]
  },
  photo: {
    type: String,
  },
  blurHash: String,
  like: {
    type: Number,
    default: 0,
  },
  comment: {
    type: Number,
    default: 0,
  },
  createUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
  },
});

export default mongoose.model("Post", PostSchema);
