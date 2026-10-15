const mongoose = require('mongoose');
const { NOTE_TOPICS } = require('../utils/constants');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    topic: { type: String, required: true, enum: NOTE_TOPICS, default: 'General' },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
    codeSnippet: { type: String, default: '', maxlength: 10000 },
    complexity: { type: String, default: '', maxlength: 200 },
  },
  { timestamps: true }
);

noteSchema.index({ topic: 1, updatedAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
