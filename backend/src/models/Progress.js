const mongoose = require('mongoose');
const { ITEM_TYPES, PROGRESS_STATUSES } = require('../utils/constants');

const progressSchema = new mongoose.Schema(
  {
    itemType: { type: String, required: true, enum: ITEM_TYPES },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String, required: true, enum: PROGRESS_STATUSES, default: 'in_progress' },
    lastStudiedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// The unique index is what stops the same problem being counted twice.
progressSchema.index({ itemType: 1, itemId: 1 }, { unique: true });
progressSchema.index({ itemType: 1, status: 1 });
progressSchema.index({ lastStudiedAt: -1 });

module.exports = mongoose.model('Progress', progressSchema);
