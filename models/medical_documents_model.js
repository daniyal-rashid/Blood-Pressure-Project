const mongoose = require("mongoose");

const medicalDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documents: [
      {
        documentURL: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MedicalDocument = mongoose.model(
  "MedicalDocument",
  medicalDocumentSchema
);
module.exports = BPModel;
