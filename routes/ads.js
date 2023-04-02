const express = require("express");
const { protect } = require("../middleware/protect");

const {
  getAds,
  getAd,
  createAd,
  deleteAd,
  updateAd,
  uploadAdPhoto,
  uploadAdProfile,
} = require("../controller/ads");

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

module.exports = router;
