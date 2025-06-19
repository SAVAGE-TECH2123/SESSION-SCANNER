const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/', async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const pairingCode = `PAIRED-CODE-${number}-${Date.now()}`;
  const sessionPath = path.join(__dirname, '..', '..', 'sessions', `${number}.json`);

  fs.writeFile(sessionPath, JSON.stringify({ number, pairingCode }), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create session' });
    }
    res.json({ pairingCode });
  });
});

module.exports = router;
