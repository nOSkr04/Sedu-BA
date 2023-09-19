import { Router } from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getStorys,
  getStory,
  createStory,
  deleteStory,
  updateStory,
  uploadStoryPhoto,
} from "../controller/story.js";

const router = Router();

//"/api/v1/storys"
router
  .route("/")
  .get(protect, getStorys)
  .post(protect, authorize("admin", "operator"), createStory);

router
  .route("/:id")
  .get(getStory)
  .delete(protect, authorize("admin", "operator"), deleteStory)
  .put(protect, authorize("admin", "operator"), updateStory);

router
  .route("/:id/upload-photo")
  .put(protect, authorize("admin", "operator"), uploadStoryPhoto);

export default router;
