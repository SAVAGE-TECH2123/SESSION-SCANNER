const express = require("express");
const cors = require("cors");
const path = require("path");

const pairingRoute = require("./routes/pairing");
const qrRoute = require("./routes/qr");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public frontend
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api", pairingRoute);
app.use("/api/qr", qrRoute);

// Catch all for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
