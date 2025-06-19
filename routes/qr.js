const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
  res.json({ qr: "This endpoint is deprecated." });
});
module.exports = router;
