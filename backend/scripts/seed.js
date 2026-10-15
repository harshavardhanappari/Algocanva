// Usage: npm run seed
// Resets algorithms, problems, bookmarks and progress. Notes are left alone.
const mongoose = require('mongoose');
const { loadEnv } = require('../src/config/env');
const { connectDB } = require('../src/config/db');
const Algorithm = require('../src/models/Algorithm');
const Problem = require('../src/models/Problem');
const Bookmark = require('../src/models/Bookmark');
const Progress = require('../src/models/Progress');
const { algorithms, problems } = require('./seedData');

(async () => {
  try {
    const env = loadEnv();
    await connectDB(env.mongoUri);
    await Promise.all([Algorithm.deleteMany({}), Problem.deleteMany({}), Bookmark.deleteMany({}), Progress.deleteMany({})]);
    await Algorithm.syncIndexes();
    await Problem.syncIndexes();
    const a = await Algorithm.insertMany(algorithms);
    const p = await Problem.insertMany(problems);
    console.log(`Seeded ${a.length} algorithms and ${p.length} problems`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();
