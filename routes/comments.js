import { Router } from "express";
const router = Router();
import { protect, authorize } from "../middleware/protect.js";
import {
  createComment,
  deleteComment,
  getComment,
  getComments,
  getPostComments,
  updateComment,
} from "../controller/comments.js";

router.route("/").get(getComments);

router
  .route("/:id")
  .get(getComment)
  .put(protect, authorize("admin", "operator"), updateComment)
  .delete(protect, deleteComment);

router.route("/:id").post(protect, createComment);
router.route("/:id/post").get(protect, getPostComments);

export default router;
