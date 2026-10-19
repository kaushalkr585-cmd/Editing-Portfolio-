import mongoose from 'mongoose';

let isConnected = false;
let lastDbError = null;

const sanitizeMongoUri = (raw) => {
  if (!raw) return '';
  let uri = raw.trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }
  return uri;
};

const autoEncodePassword = (uri) => {
  try {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@([^@\/]+)(.*)$/);
    if (!match) return uri;
    const [, protocol, username, password, host, rest] = match;
    const decoded = decodeURIComponent(password);
    const encoded = encodeURIComponent(decoded);
    return `${protocol}${username}:${encoded}@${host}${rest || '/'}`;
  } catch {
    return uri;
  }
};

export const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    console.log('[Database] MONGODB_URI not provided. Operating in high-performance in-memory / seed fallback mode.');
    lastDbError = 'MONGODB_URI environment variable is missing';
    return false;
  }

  const cleanUri = sanitizeMongoUri(rawUri);
  const candidates = [cleanUri];
  const encoded = autoEncodePassword(cleanUri);
  if (encoded !== cleanUri) {
    candidates.push(encoded);
  }

  for (const uriToTry of candidates) {
    try {
      const conn = await mongoose.connect(uriToTry, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      lastDbError = null;
      console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}`);
      return true;
    } catch (error) {
      lastDbError = error.message;
      const masked = uriToTry.replace(/:[^@]+@/, ':****@');
      console.warn(`[Database] MongoDB connection attempt failed (${masked}): ${error.message}`);
    }
  }

  isConnected = false;
  return false;
};

export const getDbStatus = () => isConnected;
export const getLastDbError = () => lastDbError;

