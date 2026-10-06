const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./config/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in dev
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production' && !req.url.startsWith('/static')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Biodiversity Management System API',
    dialect: db.dialect,
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Serve static frontend files in production build
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback SPA route handler compatible with modern Express routing
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  const indexHtml = path.join(clientDistPath, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Biodiversity Management System API Server</title></head>
          <body style="font-family: system-ui, sans-serif; padding: 40px; line-height: 1.6; background: #0f1f17; color: #e2f1e8;">
            <h1 style="color: #22c55e;">🌿 Biodiversity Management System API Server Active</h1>
            <p>The backend API server is running successfully on port <strong>${PORT}</strong>.</p>
            <p>Database Engine: <strong>${db.dialect.toUpperCase()}</strong> (Relational 3NF with Foreign Keys)</p>
            <p>To access the Web UI, run the Vite development server:</p>
            <pre style="background: #1b382b; padding: 15px; border-radius: 8px; color: #86efac;">npm run dev</pre>
            <p>Or open <a href="http://localhost:5173" style="color: #4ade80;">http://localhost:5173</a>.</p>
          </body>
        </html>
      `);
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

// Start Server after Database connection
async function startServer() {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`=============================================================`);
      console.log(`🌿 BIODIVERSITY MANAGEMENT SYSTEM (BMS) SERVER ACTIVE`);
      console.log(`🚀 API Server running at: http://localhost:${PORT}`);
      console.log(`📊 Relational SQL Engine: ${db.dialect.toUpperCase()}`);
      console.log(`🔐 Authentication: Role-Based Access Control (RBAC) Enabled`);
      console.log(`=============================================================`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
