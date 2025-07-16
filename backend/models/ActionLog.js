const mongoose = require("mongoose");

const ActionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      type: Date,
      default: Date.now,
    },
  }
);

const Action = mongoose.model("Action", ActionSchema);

module.exports = {
  Action: Action,
};
