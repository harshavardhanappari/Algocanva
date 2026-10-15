require('dotenv').config();

function loadEnv() {
  const missing = ['MONGODB_URI'].filter((k) => !process.env[k] || process.env[k].startsWith('your_'));
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}. Copy .env.example to .env and fill them in.`);
  }
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid port number');
  return {
    port,
    mongoUri: process.env.MONGODB_URI,
    clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
    nodeEnv: process.env.NODE_ENV || 'development',
    isProd: process.env.NODE_ENV === 'production',
  };
}
module.exports = { loadEnv };
