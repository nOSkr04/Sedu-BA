const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/protect");

const {
  getWallets,
  getWallet,
  getCvWallets,
  createWallet,
  updateWallet,
  deleteWallet,
} = require("../controller/wallets");

//"/api/v1/wallets"
router.route("/").get(getWallets).post(protect, createWallet);

router
  .route("/:id")
  .get(getWallet)
  .put(protect, authorize("admin", "operator"), updateWallet)
  .delete(protect, authorize("admin"), deleteWallet);

router.route("/:cvId/wallet").get(protect, authorize("admin"), getCvWallets);
module.exports = router;
