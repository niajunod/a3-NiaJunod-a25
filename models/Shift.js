// models/Shift.js
const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: String, required: true },
    hours: { type: Number, required: true, min: 0 },
    tips: { type: Number, required: true, min: 0 },
    dollarsPerHour: { type: Number } // derived field stored for convenience
}, { timestamps: true });

// pre-save hook to compute dollarsPerHour
ShiftSchema.pre('save', function(next) {
    if (this.hours && this.hours > 0) {
        this.dollarsPerHour = +(this.tips / this.hours).toFixed(2);
    } else {
        this.dollarsPerHour = 0;
    }
    next();
});

module.exports = mongoose.model('Shift', ShiftSchema);
