const { CATEGORIES, DIFFICULTIES, NOTE_TOPICS, ITEM_TYPES, PROGRESS_STATUSES } = require('../utils/constants');

const algorithmSpec = {
  name: { type: 'string', required: true, max: 100 },
  slug: { type: 'slug', required: true },
  category: { type: 'enum', required: true, values: CATEGORIES },
  description: { type: 'string', required: true, max: 300 },
  explanation: { type: 'string', required: true, max: 8000 },
  pseudocode: { type: 'string', required: true, max: 4000 },
  timeComplexity: { type: 'string', required: true, max: 200 },
  spaceComplexity: { type: 'string', required: true, max: 200 },
  difficulty: { type: 'enum', required: true, values: DIFFICULTIES },
  visualizationAvailable: { type: 'boolean' },
};

const problemSpec = {
  title: { type: 'string', required: true, max: 150 },
  slug: { type: 'slug', required: true },
  statement: { type: 'string', required: true, max: 6000 },
  difficulty: { type: 'enum', required: true, values: DIFFICULTIES },
  topics: { type: 'stringArray', required: true, maxItems: 8, itemMax: 40 },
  inputFormat: { type: 'string', required: true, max: 1000 },
  outputFormat: { type: 'string', required: true, max: 1000 },
  constraints: { type: 'string', required: true, max: 1000 },
  examples: { type: 'examples', required: true },
  explanation: { type: 'string', max: 4000 },
  hints: { type: 'stringArray', maxItems: 10, itemMax: 500 },
  timeComplexity: { type: 'string', required: true, max: 100 },
  spaceComplexity: { type: 'string', required: true, max: 100 },
};

const noteSpec = {
  title: { type: 'string', required: true, max: 120 },
  topic: { type: 'enum', required: true, values: NOTE_TOPICS },
  content: { type: 'string', required: true, max: 10000 },
  codeSnippet: { type: 'string', max: 10000 },
  complexity: { type: 'string', max: 200 },
};

const bookmarkSpec = {
  itemType: { type: 'enum', required: true, values: ITEM_TYPES },
  itemId: { type: 'string', required: true, max: 24 },
};

const progressCreateSpec = {
  itemType: { type: 'enum', required: true, values: ITEM_TYPES },
  itemId: { type: 'string', required: true, max: 24 },
  status: { type: 'enum', values: PROGRESS_STATUSES },
};

const progressUpdateSpec = {
  status: { type: 'enum', required: true, values: PROGRESS_STATUSES },
};

module.exports = {
  algorithmSpec, problemSpec, noteSpec, bookmarkSpec, progressCreateSpec, progressUpdateSpec,
};
