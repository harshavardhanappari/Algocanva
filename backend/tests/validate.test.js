const test = require('node:test');
const assert = require('node:assert');
const { validateBody, queryPagination, queryEnum, isObjectId, slugify } = require('../src/utils/validate');
const { noteSpec, problemSpec } = require('../src/validators/specs');
const seed = require('../scripts/seedData');

const goodNote = { title: 'Heaps', topic: 'Sorting', content: 'A heap is a tree.' };

test('valid note passes and trims', () => {
  const out = validateBody({ ...goodNote, title: '  Heaps  ', evil: { $gt: '' } }, noteSpec);
  assert.strictEqual(out.title, 'Heaps');
  assert.strictEqual(out.evil, undefined);
});

test('missing required fields are reported', () => {
  assert.throws(() => validateBody({}, noteSpec), (e) => e.status === 400 && e.details.length === 3);
});

test('invalid enum is rejected', () => {
  assert.throws(() => validateBody({ ...goodNote, topic: 'Cooking' }, noteSpec), (e) => e.status === 400);
});

test('non-string values are rejected (no object injection)', () => {
  assert.throws(() => validateBody({ ...goodNote, title: { $ne: 1 } }, noteSpec), (e) => e.status === 400);
});

test('partial update needs at least one field', () => {
  assert.throws(() => validateBody({}, noteSpec, { partial: true }), (e) => e.status === 400);
  assert.deepStrictEqual(validateBody({ title: 'x' }, noteSpec, { partial: true }), { title: 'x' });
});

test('pagination defaults and bounds', () => {
  assert.deepStrictEqual(queryPagination({}), { page: 1, limit: 12, skip: 0 });
  assert.deepStrictEqual(queryPagination({ page: '3', limit: '10' }), { page: 3, limit: 10, skip: 20 });
  assert.throws(() => queryPagination({ page: '0' }));
  assert.throws(() => queryPagination({ limit: '1000' }));
  assert.throws(() => queryPagination({ page: 'abc' }));
});

test('query params must be single strings and valid enums', () => {
  assert.throws(() => queryEnum({ difficulty: ['Easy', 'Hard'] }, 'difficulty', ['Easy']));
  assert.throws(() => queryEnum({ difficulty: { $ne: 'x' } }, 'difficulty', ['Easy']));
  assert.throws(() => queryEnum({ difficulty: 'Insane' }, 'difficulty', ['Easy']));
  assert.strictEqual(queryEnum({ difficulty: 'Easy' }, 'difficulty', ['Easy']), 'Easy');
});

test('ObjectId and slug helpers', () => {
  assert.ok(isObjectId('507f1f77bcf86cd799439011'));
  assert.ok(!isObjectId('123'));
  assert.strictEqual(slugify("Dijkstra's Algorithm!"), 'dijkstra-s-algorithm');
});

test('every seeded problem passes the problem validator', () => {
  for (const p of seed.problems) assert.doesNotThrow(() => validateBody(p, problemSpec), p.slug);
});
