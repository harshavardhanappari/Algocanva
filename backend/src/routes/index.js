const express = require('express');
const mongoose = require('mongoose');
const algo = require('../controllers/algorithmController');
const prob = require('../controllers/problemController');
const note = require('../controllers/noteController');
const bookmark = require('../controllers/bookmarkController');
const progress = require('../controllers/progressController');

const router = express.Router();

router.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'degraded',
    database: connected ? 'connected' : 'disconnected',
    uptimeSeconds: Math.round(process.uptime()),
  });
});

const crudRoutes = (path, c) => {
  router.route(path).get(c.list).post(c.create);
  router.route(`${path}/:key`).get(c.get).patch(c.update).delete(c.remove);
};
crudRoutes('/algorithms', algo);
crudRoutes('/problems', prob);
crudRoutes('/notes', note);

router.route('/bookmarks').get(bookmark.list).post(bookmark.create);
router.delete('/bookmarks/:id', bookmark.remove);

router.get('/progress/summary', progress.summary);
router.route('/progress').get(progress.list).post(progress.create);
router.patch('/progress/:id', progress.update);

module.exports = router;
