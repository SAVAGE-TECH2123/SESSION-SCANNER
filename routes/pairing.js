const express = require('express');
const router = express.Router();
const startSocket = require('../session/startSocket');

// ✅ Allowed phone numbers
const allowedNumbers = [
  '255765457691',
  '255793157892',
  '255745830630',
  '255757858480',
  '255686169965'
];

router.post('/', async (req, res) => {
  const { number } = req.body;

  // Validate phone number
  if (!allowedNumbers.includes(number)) {
    return res.status(403).json({
      error: true,
      message: '❌ This phone number is not allowed.'
    });
  }

  try {
    const pairingCode = await startSocket(number);
    if (!pairingCode) {
      return res.status(500).json({
        error: true,
        message: '❌ Failed to generate pairing code.'
      });
    }

    return res.status(200).json({
      error: false,
      message: '✅ Pairing code generated successfully.',
      code: pairingCode
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: '❌ Error generating pairing code.',
      details: err.message
    });
  }
});

module.exports = router;
