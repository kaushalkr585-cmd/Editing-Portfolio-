import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB, getDbStatus, getLastDbError } from './config/db.js';
import { initializeDataStore } from './services/dataStore.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import servicesRoutes from './routes/services.routes.js';
import inquiriesRoutes from './routes/inquiries.routes.js';
import aiRoutes from './routes/ai.routes.js';
import cloudinaryRoutes from './routes/cloudinary.routes.js';
import settingsRoutes from './routes/settings.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Allows cross-origin video posters and CDN previews
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serverless lazy initialization guard
let initPromise = null;
const ensureInit = () => {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await connectDB();
        await initializeDataStore();
      } catch (err) {
        console.error('[DataStore Init Error]', err);
      }
    })();
  }
  return initPromise;
};

app.use(async (req, res, next) => {
  await ensureInit();
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = getDbStatus();
  const dbState = mongoose.connection?.readyState ?? 0;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbConnected,
      readyState: dbState,
      host: mongoose.connection?.host || null,
      name: mongoose.connection?.name || null,
      error: dbConnected ? null : getLastDbError(),
    },
  });
});

// Serve frontend in production if built
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // If client is not built yet, return informative status
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Kaushal Kumar Portfolio API</title></head>
          <body style="font-family:sans-serif;background:#0c0c0c;color:#f5f5f5;padding:2rem;">
            <h1>Kaushal Kumar Video Editing Portfolio API</h1>
            <p>API is active. Start Vite dev server on port 5173 or build the client with <code>npm run build</code>.</p>
            <p><a href="/api/health" style="color:#b600a8;">View /api/health</a> | <a href="/api/projects" style="color:#b600a8;">View /api/projects</a></p>
          </body>
        </html>
      `);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start server
const startServer = async () => {
  await ensureInit();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🎬 Kaushal Kumar Portfolio Server running`);
    console.log(`📡 API listening on: http://localhost:${PORT}`);
    console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===============================================`);
  });
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
