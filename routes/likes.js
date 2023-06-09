import { Router } from "express";
const router = Router();
import { protect, authorize } from "../middleware/protect.js";

import {
  getLikes,
  getPostLikes,
  getLike,
  createLike,
  updateLike,
  deleteLike,
  getUsersPostLikes,
} from "../controller/likes.js";

router.route("/").get(getLikes);

router
  .route("/:id")
  .get(getLike)
  .put(protect, authorize("admin", "operator"), updateLike)
  .delete(protect, deleteLike);

router.route("/:id").post(protect, createLike);
router.route("/:id/post").get(protect, getPostLikes);
router.route("/:id/posts").get(protect, getUsersPostLikes);

export default router;
