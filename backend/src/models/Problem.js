const mongoose = require('mongoose');
const { DIFFICULTIES } = require('../utils/constants');

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    statement: { type: String, required: true, trim: true, maxlength: 6000 },
    difficulty: { type: String, required: true, enum: DIFFICULTIES },
    topics: { type: [String], validate: [(v) => v.length > 0, 'At least one topic is required'] },
    inputFormat: { type: String, required: true, trim: true, maxlength: 1000 },
    outputFormat: { type: String, required: true, trim: true, maxlength: 1000 },
    constraints: { type: String, required: true, trim: true, maxlength: 1000 },
    examples: { type: [exampleSchema], validate: [(v) => v.length > 0, 'At least one example is required'] },
    explanation: { type: String, default: '', maxlength: 4000 },
    hints: { type: [String], default: [] },
    timeComplexity: { type: String, required: true, trim: true, maxlength: 100 },
    spaceComplexity: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { timestamps: true }
);

problemSchema.index({ difficulty: 1 });
problemSchema.index({ topics: 1 });
problemSchema.index({ title: 1 });

module.exports = mongoose.model('Problem', problemSchema);
