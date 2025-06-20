// routes/qr.js
const express = require('express');
const startSocket = require('../startSocket');
const router = express.Router();

module.exports = (io) => {
  router.get('/', async (req, res) => {
    try {
      // No number needed for QR session — it will use a default session
      await startSocket(io, res, null, 'qr');

      // Success response will be sent inside startSocket after session connects
    } catch (err) {
      console.error('[QR Error]:', err);
      res.status(500).json({ error: 'Failed to start QR session.' });
    }
  });

  return router;
};
