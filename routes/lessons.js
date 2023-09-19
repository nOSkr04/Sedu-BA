import { Router } from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getLessons,
  getLesson,
  createLesson,
  deleteLesson,
  updateLesson,
  uploadLessonPhoto,
} from "../controller/lesson.js";

const router = Router();

//"/api/v1/lessons"
router
  .route("/")
  .get(protect, getLessons)
  .post(protect, authorize("admin", "operator"), createLesson);

router
  .route("/:id")
  .get(getLesson)
  .delete(protect, authorize("admin", "operator"), deleteLesson)
  .put(protect, authorize("admin", "operator"), updateLesson);

router
  .route("/:id/upload-photo")
  .put(protect, authorize("admin", "operator"), uploadLessonPhoto);

export default router;
