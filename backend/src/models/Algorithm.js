const mongoose = require('mongoose');
const { CATEGORIES, DIFFICULTIES } = require('../utils/constants');

const algorithmSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    explanation: { type: String, required: true, trim: true, maxlength: 8000 },
    pseudocode: { type: String, required: true, trim: true, maxlength: 4000 },
    timeComplexity: { type: String, required: true, trim: true, maxlength: 200 },
    spaceComplexity: { type: String, required: true, trim: true, maxlength: 200 },
    difficulty: { type: String, required: true, enum: DIFFICULTIES },
    visualizationAvailable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

algorithmSchema.index({ category: 1, difficulty: 1 });
algorithmSchema.index({ name: 1 });

module.exports = mongoose.model('Algorithm', algorithmSchema);
