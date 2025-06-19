const express = require("express");
const router = express.Router();
const startSocket = require("../startSocket");

router.post("/start-session", async (req, res) => {
  const { method, number } = req.body;

  // Validate method
  if (!method || !["QRCode", "PairingCode"].includes(method)) {
    return res.status(400).json({ error: "Invalid login method." });
  }

  // If Pairing Code, validate number
  if (method === "PairingCode" && (!number || number.trim() === "")) {
    return res.status(400).json({ error: "Phone number is required for pairing." });
  }

  const sessionId = method === "QRCode" ? `session-${Date.now()}` : number;

  try {
    const result = await startSocket(sessionId, method, number);

    if (method === "QRCode" && result.status === "QR") {
      return res.status(200).json({ qr: result.image });
    }

    if (method === "PairingCode" && result.status === "PAIRING") {
      return res.status(200).json({ code: result.code });
    }

    if (result.status === "CONNECTED") {
      return res.status(200).json({ message: "Session connected." });
    }

    return res.status(500).json({ error: "Unknown state." });
  } catch (err) {
    console.error("Session Error:", err);
    return res.status(500).json({ error: err.error || "Internal Server Error" });
  }
});

module.exports = router;
