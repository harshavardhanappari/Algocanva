const Note = require('../models/Note');
const { createCrud } = require('../services/crud');
const { noteSpec } = require('../validators/specs');
const { NOTE_TOPICS } = require('../utils/constants');

module.exports = createCrud({
  Model: Note,
  label: 'Note',
  spec: noteSpec,
  lookup: 'id',
  enumFilters: { topic: { field: 'topic', values: NOTE_TOPICS } },
  searchFields: ['title', 'content'],
  sorts: {
    '-updatedAt': { updatedAt: -1 }, updatedAt: { updatedAt: 1 },
    '-createdAt': { createdAt: -1 }, title: { title: 1 },
  },
  defaultSort: '-updatedAt',
});
