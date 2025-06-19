const express = require('express');
const router = express.Router();
const startSocket = require('../session/startSocket');

const allowedNumbers = [
  "255765457691",
  "+255793157892",
  "255745830630",
  "+255757858480",
  "+255686169965"
];

router.post('/', async (req, res) => {
  const { number } = req.body;
  if (!allowedNumbers.includes(number)) {
    return res.status(403).json({ error: "❌ Unauthorized number" });
  }
  try {
    const pairingCode = await startSocket(number);
    res.json({ pairingCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
