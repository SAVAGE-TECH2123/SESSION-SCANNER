// routes/pairing.js
const express = require('express');
const startSocket = require('../startSocket');
const router = express.Router();

module.exports = (io) => {
  router.post('/', async (req, res) => {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({ error: 'Missing phone number' });
    }

    try {
      // Start socket and pass res to allow sending a connection update response
      await startSocket(io, res, number, 'pairing');

      // Success response is sent from inside startSocket when connected
    } catch (err) {
      console.error('[Pairing Error]:', err);
      res.status(500).json({ error: 'Failed to start pairing session.' });
    }
  });

  return router;
};
