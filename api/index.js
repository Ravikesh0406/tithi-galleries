// Vercel serverless entry — the Express app itself is a (req, res) listener,
// which Vercel's Node runtime calls directly.
const app = require('../server');

module.exports = app;
