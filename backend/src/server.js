const mongoose = require('mongoose');
const { loadEnv } = require('./config/env');
const { connectDB } = require('./config/db');
const { createApp } = require('./app');

async function main() {
  const env = loadEnv();
  await connectDB(env.mongoUri);
  const app = createApp({ clientUrls: env.clientUrls, isProd: env.isProd });
  const server = app.listen(env.port, () => console.log(`API listening on port ${env.port} (${env.nodeEnv})`));

  const shutdown = async () => {
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
