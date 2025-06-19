const express = require('express');
const router = express.Router();
const startSocket = require('../session/startSocket');

// List of allowed numbers (max 5)
const allowedNumbers = [
  '255765457691',
  '+255793157892',
  '255745830630',
  '+255757858480',
  '+255686169965'
];

// Route: POST /pairing
router.post('/', async (req, res) => {
  const { number } = req.body;

  // Validate input
  if (!number || typeof number !== 'string') {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  // Check if number is allowed
  if (!allowedNumbers.includes(number)) {
    return res.status(403).json({ error: '❌ Number not authorized.' });
  }

  try {
    const pairingCode = await startSocket(number);
    res.json({ pairingCode });
  } catch (err) {
    res.status(500).json({ error: '❌ Failed to generate pairing code.' });
  }
});

module.exports = router;
