const HttpError = require('./HttpError');

const OBJECT_ID = /^[0-9a-f]{24}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isObjectId = (v) => typeof v === 'string' && OBJECT_ID.test(v);
const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function assertObjectId(value, name = 'id') {
  if (!isObjectId(value)) throw new HttpError(400, `Invalid ${name}: must be a 24-character hex ObjectId`);
  return value;
}

// ---- body validation -------------------------------------------------
// Each rule: { type, required, max, min, values, maxItems }
function checkValue(key, raw, rule) {
  switch (rule.type) {
    case 'string': {
      if (typeof raw !== 'string') return { error: `${key} must be a string` };
      const v = raw.trim();
      const min = rule.min ?? (rule.required ? 1 : 0);
      if (v.length < min) return { error: `${key} must be at least ${min} character(s)` };
      if (v.length > (rule.max ?? 5000)) return { error: `${key} must be at most ${rule.max ?? 5000} characters` };
      return { value: v };
    }
    case 'slug': {
      if (typeof raw !== 'string' || !SLUG.test(raw)) return { error: `${key} must be lowercase letters, numbers and hyphens (e.g. "merge-sort")` };
      if (raw.length > 80) return { error: `${key} must be at most 80 characters` };
      return { value: raw };
    }
    case 'boolean':
      return typeof raw === 'boolean' ? { value: raw } : { error: `${key} must be true or false` };
    case 'enum':
      return rule.values.includes(raw) ? { value: raw } : { error: `${key} must be one of: ${rule.values.join(', ')}` };
    case 'stringArray': {
      if (!Array.isArray(raw)) return { error: `${key} must be an array of strings` };
      if (raw.length > (rule.maxItems ?? 20)) return { error: `${key} can have at most ${rule.maxItems ?? 20} items` };
      const out = [];
      for (const item of raw) {
        if (typeof item !== 'string' || !item.trim() || item.trim().length > (rule.itemMax ?? 200)) {
          return { error: `${key} items must be non-empty strings (max ${rule.itemMax ?? 200} characters)` };
        }
        out.push(item.trim());
      }
      if (rule.required && out.length === 0) return { error: `${key} needs at least one item` };
      return { value: out };
    }
    case 'examples': {
      if (!Array.isArray(raw) || raw.length > 10) return { error: `${key} must be an array of at most 10 examples` };
      if (rule.required && raw.length === 0) return { error: `${key} needs at least one example` };
      const out = [];
      for (const ex of raw) {
        if (!ex || typeof ex.input !== 'string' || typeof ex.output !== 'string' ||
            !ex.input.trim() || !ex.output.trim()) {
          return { error: `each item in ${key} needs a non-empty "input" and "output" string` };
        }
        if (ex.explanation !== undefined && typeof ex.explanation !== 'string') {
          return { error: `${key}[].explanation must be a string` };
        }
        out.push({ input: ex.input.trim(), output: ex.output.trim(), explanation: (ex.explanation || '').trim() });
      }
      return { value: out };
    }
    default:
      return { error: `${key}: unsupported rule type` };
  }
}

function validateBody(body, spec, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
  const out = {};
  const errors = [];
  for (const [key, rule] of Object.entries(spec)) {
    const raw = body[key];
    if (raw === undefined) {
      if (!partial && rule.required) errors.push(`${key} is required`);
      continue;
    }
    const r = checkValue(key, raw, rule);
    if (r.error) errors.push(r.error);
    else out[key] = r.value;
  }
  if (partial && !errors.length && Object.keys(out).length === 0) {
    errors.push('Provide at least one valid field to update');
  }
  if (errors.length) throw new HttpError(400, 'Validation failed', errors);
  return out; // unknown fields are dropped on purpose
}

// ---- query-string helpers -------------------------------------------
function queryString(query, name, max = 100) {
  const v = query[name];
  if (v === undefined) return undefined;
  if (typeof v !== 'string') throw new HttpError(400, `Query parameter "${name}" must be a single string`);
  const t = v.trim();
  if (t.length > max) throw new HttpError(400, `Query parameter "${name}" is too long`);
  return t || undefined;
}

function queryEnum(query, name, values) {
  const v = queryString(query, name);
  if (v !== undefined && !values.includes(v)) {
    throw new HttpError(400, `Invalid "${name}": must be one of ${values.join(', ')}`);
  }
  return v;
}

function queryPagination(query, { defaultLimit = 12, maxLimit = 100 } = {}) {
  const read = (name, def, min, max) => {
    const raw = queryString(query, name, 10);
    if (raw === undefined) return def;
    if (!/^\d+$/.test(raw)) throw new HttpError(400, `"${name}" must be a positive integer`);
    const n = Number(raw);
    if (n < min || n > max) throw new HttpError(400, `"${name}" must be between ${min} and ${max}`);
    return n;
  };
  const page = read('page', 1, 1, 100000);
  const limit = read('limit', defaultLimit, 1, maxLimit);
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = {
  isObjectId, assertObjectId, slugify, escapeRegex,
  validateBody, queryString, queryEnum, queryPagination,
};
