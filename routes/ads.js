import express from "express";

import { protect, authorize } from "../middleware/protect.js";

import {
  getAds,
  getAd,
  createAd,
  deleteAd,
  updateAd,
  uploadAdPhoto,
  uploadAdProfile,
} from "../controller/ads.js";

const router = express.Router();

//"/api/v1/ads"

router.route("/").get(getAds).post(protect, createAd);

router
  .route("/:id")
  .get(getAd)
  .delete(protect, deleteAd)
  .put(protect, updateAd);

router.route("/:id/photo").put(uploadAdPhoto);
router.route("/:id/profile").put(uploadAdProfile);

export default router;
