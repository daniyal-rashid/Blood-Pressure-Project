const express = require("express");
const router = express.Router();
const {
  handleUserSignUp,
  handleUserLogin,
} = require("../controllers/user_controller");

router.route("/signup").post(handleUserSignUp);
router.route("/login").post(handleUserLogin);

module.exports = router;
