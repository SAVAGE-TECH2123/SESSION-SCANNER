const express = require('express');
const router = express.Router();

router.get('/:number', (req, res) => {
  const { number } = req.params;
  const dummyQR = `https://api.qrserver.com/v1/create-qr-code/?data=PAIR-${number}-${Date.now()}&size=200x200`;
  res.json({ qr: dummyQR });
});

module.exports = router;
