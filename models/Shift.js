const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: { type: String, required: true },
    hours: { type: Number, required: true },
    tips: { type: Number, required: true },
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Shift || mongoose.model("Shift", shiftSchema);
