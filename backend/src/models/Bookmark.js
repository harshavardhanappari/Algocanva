const mongoose = require('mongoose');
const { ITEM_TYPES } = require('../utils/constants');

const bookmarkSchema = new mongoose.Schema(
  {
    itemType: { type: String, required: true, enum: ITEM_TYPES },
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

// One bookmark per item in the shared demo workspace.
bookmarkSchema.index({ itemType: 1, itemId: 1 }, { unique: true });
bookmarkSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
