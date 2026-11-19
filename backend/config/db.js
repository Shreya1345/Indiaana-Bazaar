const mongoose = require('mongoose');
const tls = require('tls');

const MAX_CONNECTION_ATTEMPTS = 5;
const tls12SecureContext = tls.createSecureContext({
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.2'
});

const getConnectionOptions = (mongoUri) => {
  const uri = new URL(mongoUri);
  const tlsOption = uri.searchParams.get('tls') ?? uri.searchParams.get('ssl');
  const tlsEnabled = tlsOption === null
    ? uri.protocol === 'mongodb+srv:'
    : tlsOption.toLowerCase() === 'true';

  if (!tlsEnabled) return {};

  return {
    tls: true,
    secureContext: tls12SecureContext
  };
};

const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_CONNECTION_ATTEMPTS; attempt += 1) {
    try {
      const conn = await mongoose.connect(
        process.env.MONGO_URI,
        getConnectionOptions(process.env.MONGO_URI)
      );
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      if (attempt === MAX_CONNECTION_ATTEMPTS) {
        console.error(`MongoDB connection failed after ${MAX_CONNECTION_ATTEMPTS} attempts: ${error.message}`);
        process.exit(1);
      }

      const retryDelay = Math.min(1000 * (2 ** attempt), 10000);
      console.error(`MongoDB connection attempt ${attempt} failed: ${error.message}. Retrying in ${retryDelay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

module.exports = connectDB;
