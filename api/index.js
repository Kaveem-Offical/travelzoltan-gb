// Vercel serverless function entry point
// This wraps the Express app for serverless deployment

const app = require('../server/server.js');

module.exports = app;
