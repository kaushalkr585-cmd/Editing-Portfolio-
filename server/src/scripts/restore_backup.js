import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const backupPath = path.resolve(__dirname, '../../data/backup_old_cluster.json');

async function restore() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  console.log('Connecting to target MongoDB cluster...');
  await mongoose.connect(uri);
  console.log('Connected to target MongoDB cluster successfully.');

  if (!fs.existsSync(backupPath)) {
    console.error('Backup file not found at:', backupPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const db = mongoose.connection.db;

  for (const [collectionName, docs] of Object.entries(data)) {
    if (Array.isArray(docs) && docs.length > 0) {
      const collection = db.collection(collectionName);
      const existingCount = await collection.countDocuments();
      if (existingCount === 0) {
        await collection.insertMany(docs);
        console.log(`Restored ${docs.length} documents into ${collectionName}`);
      } else {
        console.log(`Skipping ${collectionName} (${existingCount} documents already exist)`);
      }
    }
  }

  console.log('Migration completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

restore().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
