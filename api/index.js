// Vercel Serverless Function entry point
// Forwards all /api requests to the Express application
const app = require('../server/index');

module.exports = app;
