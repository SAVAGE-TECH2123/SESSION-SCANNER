const express = require("express");
const fs = require("fs");
const path = require("path");
const { toBuffer } = require("qrcode");
const router = express.Router();

router.get("/qr/:number", async (req, res) => {
  const { number } = req.params;
  const qrPath = path.join(__dirname, "../sessions", number, "store.json");

  try {
    if (!fs.existsSync(qrPath)) {
      return res.status(404).json({ success: false, message: "QR Code not generated yet." });
    }

    const qrData = fs.readFileSync(qrPath, "utf-8");
    const { qr } = JSON.parse(qrData);

    if (!qr) {
      return res.status(404).json({ success: false, message: "QR Code data not found." });
    }

    // Convert QR to PNG buffer
    const buffer = await toBuffer(qr);

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": buffer.length
    });
    res.end(buffer);

  } catch (error) {
    console.error("Error fetching QR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch QR Code." });
  }
});

module.exports = router;
