const mongoose = require("mongoose");

const bpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  systolic: {
    type: String,
    required: true,
  },
  diastolic: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

const BPModel = mongoose.model("BPModel", bpSchema);
module.exports = BPModel;
