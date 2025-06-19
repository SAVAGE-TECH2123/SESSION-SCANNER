const express = require("express");
const router = express.Router();
const qrcode = require("qrcode");

router.get("/generate", async (req, res) => {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: "Missing text parameter" });
  }

  try {
    const qrImage = await qrcode.toDataURL(text);
    res.status(200).json({ image: qrImage });
  } catch (err) {
    console.error("QR Generation Error:", err);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

module.exports = router;
