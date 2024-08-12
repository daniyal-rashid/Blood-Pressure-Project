const express = require("express");
const router = express.Router();
const {
  handleUserSignUp,
  handleUserLogin,
} = require("../controllers/user_controller");
const { handleInputBP, getAllBPdata } = require("../controllers/bp_controller");

router.route("/signup").post(handleUserSignUp);
router.route("/login").post(handleUserLogin);

// BP controller routes
router.route("/inputbp").post(handleInputBP);
router.route("/bphistory").get(getAllBPdata);

module.exports = router;
