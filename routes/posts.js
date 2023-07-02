import { Router } from "express";
import { protect } from "../middleware/protect.js";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getUserPosts,
  updatePost,
  uploadPostPhoto,
} from "../controller/posts.js";

const router = Router();

//"/api/v1/posts"
router.route("/").get(getPosts).post(protect, createPost);
router.route("/:id/user").get(protect, getUserPosts);

router.route("/:id/photo").put(protect, uploadPostPhoto);
router
  .route("/:id")
  .get(protect, getPost)
  .delete(protect, deletePost)
  .put(protect, updatePost);

export default router;
