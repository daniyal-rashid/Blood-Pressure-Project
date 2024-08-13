const express = require("express");
const router = express.Router();
const {
  handleUserSignUp,
  handleUserLogin,
  uploadMedicalDocument,
  handleEditProfile,
  handleViewProfile,
  getAllDocuments,
} = require("../controllers/user_controller");
const { handleInputBP, getAllBPdata } = require("../controllers/bp_controller");
const upload = require("../middleware/multer.js");

router.route("/signup").post(handleUserSignUp);
router.route("/login").post(handleUserLogin);

// BP controller routes
router.route("/inputbp").post(handleInputBP);
router.route("/bphistory").get(getAllBPdata);

// medical document upload route
router
  .route("/uploaddocument")
  .post(
    upload.fields([{ name: "medicalDocument", maxCount: 1 }]),
    uploadMedicalDocument
  );

// get all documents
router.route("/getdocuments").get(getAllDocuments);

// View profile route
router.route("/viewprofile").get(handleViewProfile);

// Edit profile route
router
  .route("/editprofile")
  .post(
    upload.fields([{ name: "profilePic", maxCount: 1 }]),
    handleEditProfile
  );

module.exports = router;
