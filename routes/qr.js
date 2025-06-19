const express = require('express');
const router = express.Router();

// Example QR code route — placeholder for future expansion
// Currently unused, but useful if you later want to display QR codes in the browser

router.get('/', (req, res) => {
  res.status(200).json({ message: 'QR endpoint is active but not used yet.' });
});

module.exports = router;
