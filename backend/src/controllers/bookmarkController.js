const Bookmark = require('../models/Bookmark');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { validateBody, assertObjectId, queryEnum, queryPagination } = require('../utils/validate');
const { bookmarkSpec } = require('../validators/specs');
const { ITEM_TYPES } = require('../utils/constants');
const { assertItemExists, attachItems } = require('../services/items');

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = queryPagination(req.query, { defaultLimit: 50, maxLimit: 100 });
  const itemType = queryEnum(req.query, 'itemType', ITEM_TYPES);
  const filter = itemType ? { itemType } : {};
  const [rows, total] = await Promise.all([
    Bookmark.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Bookmark.countDocuments(filter),
  ]);
  const data = await attachItems(rows);
  res.json({ success: true, data, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
});

const create = asyncHandler(async (req, res) => {
  const { itemType, itemId } = validateBody(req.body, bookmarkSpec);
  assertObjectId(itemId, 'itemId');
  await assertItemExists(itemType, itemId);
  try {
    const doc = await Bookmark.create({ itemType, itemId });
    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, 'This item is already bookmarked');
    throw err;
  }
});

const remove = asyncHandler(async (req, res) => {
  const doc = await Bookmark.findByIdAndDelete(assertObjectId(req.params.id));
  if (!doc) throw new HttpError(404, 'Bookmark not found');
  res.status(204).end();
});

module.exports = { list, create, remove };
