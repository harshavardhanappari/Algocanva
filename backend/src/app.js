const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp({ clientUrls = [], isProd = false } = {}) {
  const app = express();
  if (isProd) app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // allow tools like curl/Postman (no Origin header) and the configured frontend(s)
        if (!origin || clientUrls.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
    })
  );
  app.use(express.json({ limit: '100kb' }));

  // Public write endpoints are a shared demo, so throttle them.
  const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Too many write requests, please slow down' } },
  });
  app.use('/api', (req, res, next) => (req.method === 'GET' ? next() : writeLimiter(req, res, next)));

  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
