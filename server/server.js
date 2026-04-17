require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./models');

// Import routes
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded documents statically (only for mock/dev)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Determine client dist path (try multiple locations for local dev vs Vercel)
const possiblePaths = [
  path.join(__dirname, '../client/dist'),
  path.join(__dirname, '../../client/dist'),
  path.join(process.cwd(), 'client/dist'),
  '/var/task/client/dist'
];

let clientDistPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    clientDistPath = p;
    console.log('Found client dist at:', p);
    break;
  }
}

// Serve React client static files if found
if (clientDistPath) {
  app.use(express.static(clientDistPath));
  
  // SPA catch-all: serve index.html for any non-API routes
  app.get('*', (req, res) => {
    const indexPath = path.join(clientDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'index.html not found' });
    }
  });
} else {
  console.warn('Client dist not found, serving API only');
  app.get('*', (req, res) => {
    res.status(404).json({ error: 'Client not built. Run npm run build in client folder.' });
  });
}

// Health check endpoint (API only)
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Visa Booking Platform API is running!' });
});

// Start the server (local dev only, not for Vercel serverless)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const startServer = async () => {
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Unable to connect to the database or start server:', error);
      process.exit(1);
    }
  };
  
  startServer();
}

// Export for Vercel serverless
module.exports = app;
