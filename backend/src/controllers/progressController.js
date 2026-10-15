const Progress = require('../models/Progress');
const Algorithm = require('../models/Algorithm');
const Problem = require('../models/Problem');
const Bookmark = require('../models/Bookmark');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { validateBody, assertObjectId, queryEnum, queryPagination } = require('../utils/validate');
const { progressCreateSpec, progressUpdateSpec } = require('../validators/specs');
const { ITEM_TYPES, PROGRESS_STATUSES } = require('../utils/constants');
const { assertItemExists, attachItems } = require('../services/items');

// Once something is completed it can only move back to "in_progress"
// (re-opening it), never straight to "not_started".
function assertTransition(from, to) {
  if (from === 'completed' && to === 'not_started') {
    throw new HttpError(400, 'A completed item cannot go back to not_started; set it to in_progress instead');
  }
}

function applyStatus(doc, status) {
  doc.status = status;
  doc.lastStudiedAt = new Date();
  doc.completedAt = status === 'completed' ? doc.completedAt || new Date() : null;
}

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = queryPagination(req.query, { defaultLimit: 100, maxLimit: 200 });
  const filter = {};
  const itemType = queryEnum(req.query, 'itemType', ITEM_TYPES);
  const status = queryEnum(req.query, 'status', PROGRESS_STATUSES);
  if (itemType) filter.itemType = itemType;
  if (status) filter.status = status;
  const [rows, total] = await Promise.all([
    Progress.find(filter).sort({ lastStudiedAt: -1 }).skip(skip).limit(limit).lean(),
    Progress.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: await attachItems(rows),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
});

const create = asyncHandler(async (req, res) => {
  const { itemType, itemId, status = 'in_progress' } = validateBody(req.body, progressCreateSpec);
  assertObjectId(itemId, 'itemId');
  await assertItemExists(itemType, itemId);
  if (await Progress.exists({ itemType, itemId })) {
    throw new HttpError(409, 'Progress already exists for this item; use PATCH /api/progress/:id');
  }
  const doc = new Progress({ itemType, itemId });
  applyStatus(doc, status);
  try {
    await doc.save();
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, 'Progress already exists for this item');
    throw err;
  }
  res.status(201).json({ success: true, data: doc });
});

const update = asyncHandler(async (req, res) => {
  const id = assertObjectId(req.params.id);
  const { status } = validateBody(req.body, progressUpdateSpec);
  const doc = await Progress.findById(id);
  if (!doc) throw new HttpError(404, 'Progress record not found');
  assertTransition(doc.status, status);
  applyStatus(doc, status);
  await doc.save();
  res.json({ success: true, data: doc });
});

const summary = asyncHandler(async (req, res) => {
  const [algoTotal, problemTotal, bookmarks, grouped, problems, completedProblemRows, recentRows] =
    await Promise.all([
      Algorithm.countDocuments(),
      Problem.countDocuments(),
      Bookmark.countDocuments(),
      Progress.aggregate([{ $group: { _id: { t: '$itemType', s: '$status' }, n: { $sum: 1 } } }]),
      Problem.find().select('topics').lean(),
      Progress.find({ itemType: 'problem', status: 'completed' }).select('itemId').lean(),
      Progress.find({ itemType: 'algorithm' }).sort({ lastStudiedAt: -1 }).limit(5).lean(),
    ]);

  const count = (t, s) => grouped.find((g) => g._id.t === t && g._id.s === s)?.n || 0;

  // Only count records whose target still exists (deletes also clean up, this is a safety net).
  const algoInProgress = count('algorithm', 'in_progress');
  const algoCompleted = count('algorithm', 'completed');
  const problemInProgress = count('problem', 'in_progress');
  const problemCompleted = count('problem', 'completed');

  const completedIds = new Set(completedProblemRows.map((r) => String(r.itemId)));
  const topicMap = new Map();
  for (const p of problems) {
    for (const topic of p.topics) {
      const entry = topicMap.get(topic) || { topic, total: 0, completed: 0 };
      entry.total += 1;
      if (completedIds.has(String(p._id))) entry.completed += 1;
      topicMap.set(topic, entry);
    }
  }
  const byTopic = [...topicMap.values()]
    .map((t) => ({ ...t, percent: t.total ? Math.round((t.completed / t.total) * 100) : 0 }))
    .sort((a, b) => b.total - a.total || a.topic.localeCompare(b.topic));

  const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);
  const recent = (await attachItems(recentRows)).filter((r) => r.item);

  res.json({
    success: true,
    data: {
      algorithms: {
        total: algoTotal,
        notStarted: Math.max(0, algoTotal - algoInProgress - algoCompleted),
        inProgress: algoInProgress,
        completed: algoCompleted,
        completionPercent: pct(algoCompleted, algoTotal),
      },
      problems: {
        total: problemTotal,
        attempted: problemInProgress + problemCompleted,
        completed: problemCompleted,
        completionPercent: pct(problemCompleted, problemTotal),
      },
      byTopic,
      recentAlgorithms: recent,
      totalBookmarks: bookmarks,
    },
  });
});

module.exports = { list, create, update, summary };
