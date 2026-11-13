require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const categoryRoutes = require('./routes/categories');
const centerRoutes = require('./routes/centers');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecocycle';

// ---------------------------------------------------------------------
// 1. Database Connection (MongoDB via Mongoose)
// ---------------------------------------------------------------------
let isMongoConnected = false;

async function connectMongoDB() {
  console.log(`[MongoDB] Attempting connection to: ${MONGODB_URI}`);
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('✅ [MongoDB] Successfully connected to database.');

    // Auto-seed initial demo accounts and categories if empty
    autoSeedIfEmpty();
  } catch (err) {
    isMongoConnected = false;
    console.warn(`⚠️ [MongoDB] Connection note: ${err.message}`);
    console.warn('💡 [MongoDB Tip] If MongoDB is running on Docker, Homebrew, or Atlas:');
    console.warn('   Update MONGODB_URI in .env (e.g., mongodb+srv://... or mongodb://localhost:27017/ecocycle).');
  }
}

mongoose.connection.on('connected', () => {
  isMongoConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.warn('⚠️ [MongoDB] Disconnected from database.');
});

// Auto seed helper
async function autoSeedIfEmpty() {
  try {
    const User = require('./models/User');
    const CollectionRequest = require('./models/CollectionRequest');
    const [userCount, reqCount] = await Promise.all([
      User.countDocuments(),
      CollectionRequest.countDocuments(),
    ]);
    if (userCount === 0 || reqCount === 0) {
      console.log('🌱 [MongoDB] Empty collections detected. Auto-seeding initial demo data...');
      const { runSeed } = require('./scripts/seed');
      await runSeed(false);
      console.log('✅ [MongoDB] Auto-seeded demo users, categories, centers & 8 sample requests.');
    }
  } catch (seedErr) {
    console.warn('[MongoDB] Auto-seed check finished:', seedErr.message);
  }
}

connectMongoDB();

// ---------------------------------------------------------------------
// 2. Middleware & CORS Configuration
// ---------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for API consumers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging in development
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
  }
  next();
});

// ---------------------------------------------------------------------
// 3. Health & Diagnostic Endpoint
// ---------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const mongoState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.json({
    status: 'healthy',
    database: {
      type: 'MongoDB (Mongoose)',
      status: states[mongoState] || 'Unknown',
      connected: mongoState === 1,
      uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'),
    },
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------
// 4. API Endpoints
// ---------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/stats', statsRoutes);

// ---------------------------------------------------------------------
// 5. Static Frontend Serving
// ---------------------------------------------------------------------
app.use(express.static(__dirname));

// Error handling middleware
app.use(errorHandler);

// SPA routing fallback (return index.html for unknown non-API routes)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---------------------------------------------------------------------
// 6. Start Server (with automatic port conflict fallback)
// ---------------------------------------------------------------------
let server;
function startServer(port) {
  server = app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`  🚀 EcoCycle E-Waste Platform Server Started`);
    console.log(`  🌐 Frontend & API: http://localhost:${port}`);
    console.log(`  📊 Health check:   http://localhost:${port}/api/health`);
    console.log(`  🗄️ Database:       MongoDB (Mongoose v${mongoose.version})`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = Number(port) + 1;
      console.warn(`⚠️ Port ${port} is occupied (common on macOS AirPlay / ControlCenter). Automatically switching to port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Server error:', err);
    }
  });

  return server;
}

if (require.main === module) {
  startServer(Number(PORT));
}

module.exports = { app, server, startServer, connectMongoDB };
