const express = require("express");
const { protect, authorize } = require("../middleware/protect");

const {
  register,
  login,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  logout,
  authMeUser,
  invoiceTime,
  chargeTime,
  invoiceCheck,
} = require("../controller/users");

const { getUserArticles } = require("../controller/articles");

const router = express.Router();

//"/api/v1/users"
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);

router.route("/callbacks/:id/:numId").get(chargeTime);
router.route("/check/challbacks/:id/:numId").get(invoiceCheck);
router.use(protect);

//"/api/v1/users"
router
  .route("/")
  .get(authorize("admin"), getUsers)
  .post(authorize("admin"), createUser);
router.route("/me").get(protect, authMeUser);
router.route("/invoice/:id").post(invoiceTime);
router.route("/:id").get(getUser).put(updateUser).delete(protect, deleteUser);

router.route("/:id/articles").get(getUserArticles);

module.exports = router;
