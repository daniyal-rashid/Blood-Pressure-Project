const express = require("express");
const router = express.Router();
const {
  handleUserSignUp,
  handleUserLogin,
} = require("../controllers/user_controller");
const { handleInputBP } = require("../controllers/bp_controller");

router.route("/signup").post(handleUserSignUp);
router.route("/login").post(handleUserLogin);

// BP controller routes
router.route("/inputbp").post(handleInputBP);

module.exports = router;
