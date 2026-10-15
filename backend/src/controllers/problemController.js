const Problem = require('../models/Problem');
const { createCrud } = require('../services/crud');
const { problemSpec } = require('../validators/specs');
const { DIFFICULTIES } = require('../utils/constants');
const { removeReferences } = require('../services/items');

module.exports = createCrud({
  Model: Problem,
  label: 'Problem',
  spec: problemSpec,
  lookup: 'slug',
  nameField: 'title',
  enumFilters: { difficulty: { field: 'difficulty', values: DIFFICULTIES } },
  arrayFilters: { topic: 'topics' },
  searchFields: ['title', 'statement'],
  sorts: { title: { title: 1 }, '-title': { title: -1 }, '-createdAt': { createdAt: -1 }, createdAt: { createdAt: 1 } },
  defaultSort: 'title',
  onDelete: (doc) => removeReferences('problem', doc._id),
});
