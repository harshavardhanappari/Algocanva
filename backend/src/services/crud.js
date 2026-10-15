const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');
const {
  validateBody, assertObjectId, slugify, escapeRegex,
  queryString, queryEnum, queryPagination,
} = require('../utils/validate');

/**
 * Builds list/get/create/update/remove handlers for a resource so the
 * algorithms, problems and notes controllers don't repeat the same code.
 *
 * cfg:
 *  Model, label, spec
 *  lookup: 'slug' | 'id'            how GET /:key finds a single record
 *  nameField                        used to derive a slug when none is sent
 *  enumFilters: { queryParam: { field, values } }
 *  arrayFilters: { queryParam: field }   exact match on an array/string field
 *  searchFields: [fields]
 *  sorts: { sortParam: mongoSort }, defaultSort
 *  onDelete(doc)                    clean-up hook
 */
function createCrud(cfg) {
  const {
    Model, label, spec, lookup = 'id', nameField,
    enumFilters = {}, arrayFilters = {}, searchFields = [],
    sorts = {}, defaultSort = '-createdAt', onDelete,
  } = cfg;

  const list = asyncHandler(async (req, res) => {
    const { page, limit, skip } = queryPagination(req.query);
    const filter = {};

    for (const [param, { field, values }] of Object.entries(enumFilters)) {
      const v = queryEnum(req.query, param, values);
      if (v) filter[field] = v;
    }
    for (const [param, field] of Object.entries(arrayFilters)) {
      const v = queryString(req.query, param, 50);
      if (v) filter[field] = v;
    }
    const search = queryString(req.query, 'search', 80);
    if (search && searchFields.length) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = searchFields.map((f) => ({ [f]: rx }));
    }

    const sortKey = queryString(req.query, 'sort', 30) || defaultSort;
    const sort = sorts[sortKey];
    if (!sort) throw new HttpError(400, `Invalid "sort": use one of ${Object.keys(sorts).join(', ')}`);

    const [data, total] = await Promise.all([
      Model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Model.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  });

  const get = asyncHandler(async (req, res) => {
    const key = req.params.key;
    let doc;
    if (lookup === 'slug') {
      doc = await Model.findOne({ slug: String(key).toLowerCase() }).lean();
    } else {
      doc = await Model.findById(assertObjectId(key)).lean();
    }
    if (!doc) throw new HttpError(404, `${label} not found`);
    res.json({ success: true, data: doc });
  });

  const create = asyncHandler(async (req, res) => {
    let body = req.body;
    if (spec.slug && body && typeof body === 'object' && body.slug === undefined && typeof body[nameField] === 'string') {
      body = { ...body, slug: slugify(body[nameField]) };
    }
    const clean = validateBody(body, spec);
    const doc = await Model.create(clean);
    res.status(201).json({ success: true, data: doc });
  });

  const update = asyncHandler(async (req, res) => {
    const id = assertObjectId(req.params.key);
    const clean = validateBody(req.body, spec, { partial: true });
    const doc = await Model.findByIdAndUpdate(id, { $set: clean }, { new: true, runValidators: true });
    if (!doc) throw new HttpError(404, `${label} not found`);
    res.json({ success: true, data: doc });
  });

  const remove = asyncHandler(async (req, res) => {
    const id = assertObjectId(req.params.key);
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) throw new HttpError(404, `${label} not found`);
    if (onDelete) await onDelete(doc);
    res.status(204).end();
  });

  return { list, get, create, update, remove };
}

module.exports = { createCrud };
