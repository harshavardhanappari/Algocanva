const Algorithm = require('../models/Algorithm');
const { createCrud } = require('../services/crud');
const { algorithmSpec } = require('../validators/specs');
const { CATEGORIES, DIFFICULTIES } = require('../utils/constants');
const { removeReferences } = require('../services/items');

module.exports = createCrud({
  Model: Algorithm,
  label: 'Algorithm',
  spec: algorithmSpec,
  lookup: 'slug',
  nameField: 'name',
  enumFilters: {
    category: { field: 'category', values: CATEGORIES },
    difficulty: { field: 'difficulty', values: DIFFICULTIES },
  },
  searchFields: ['name', 'description'],
  sorts: { name: { name: 1 }, '-name': { name: -1 }, '-createdAt': { createdAt: -1 }, createdAt: { createdAt: 1 } },
  defaultSort: 'name',
  onDelete: (doc) => removeReferences('algorithm', doc._id),
});
