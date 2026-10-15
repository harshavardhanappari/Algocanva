const Algorithm = require('../models/Algorithm');
const Problem = require('../models/Problem');
const HttpError = require('../utils/HttpError');

const MODELS = { algorithm: Algorithm, problem: Problem };
const SUMMARY_FIELDS = {
  algorithm: 'name slug category difficulty description',
  problem: 'title slug difficulty topics',
};

// Throws 404 if the referenced algorithm/problem doesn't exist.
async function assertItemExists(itemType, itemId) {
  const found = await MODELS[itemType].exists({ _id: itemId });
  if (!found) throw new HttpError(404, `No ${itemType} found with id ${itemId}`);
}

// Adds an `item` summary to each bookmark/progress record. Records whose
// target was deleted get item = null.
async function attachItems(records) {
  const out = records.map((r) => ({ ...r, item: null }));
  for (const type of Object.keys(MODELS)) {
    const ids = out.filter((r) => r.itemType === type).map((r) => r.itemId);
    if (!ids.length) continue;
    const items = await MODELS[type].find({ _id: { $in: ids } }).select(SUMMARY_FIELDS[type]).lean();
    const byId = new Map(items.map((i) => [String(i._id), i]));
    out.forEach((r) => {
      if (r.itemType === type) r.item = byId.get(String(r.itemId)) || null;
    });
  }
  return out;
}

// Removes bookmarks/progress that point at a deleted algorithm or problem.
async function removeReferences(itemType, itemId) {
  const Bookmark = require('../models/Bookmark');
  const Progress = require('../models/Progress');
  await Promise.all([
    Bookmark.deleteMany({ itemType, itemId }),
    Progress.deleteMany({ itemType, itemId }),
  ]);
}

module.exports = { assertItemExists, attachItems, removeReferences };
