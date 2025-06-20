const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const startSocket = require("../startSocket");

router.post("/pair", async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.status(400).json({ success: false, message: "Phone number is required." });
  }

  const sessionDir = path.join(__dirname, "../sessions", number);

  // Check if session already exists
  if (fs.existsSync(sessionDir)) {
    return res.status(200).json({
      success: true,
      message: `Session already exists for ${number}`,
      sessionPath: `/sessions/${number}`
    });
  }

  try {
    await startSocket(number, res); // Start the WhatsApp connection
  } catch (error) {
    console.error("Failed to start socket:", error);
    res.status(500).json({ success: false, message: "Failed to start WhatsApp session." });
  }
});

module.exports = router;
