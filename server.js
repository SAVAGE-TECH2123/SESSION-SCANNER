// server.js const express = require("express"); const app = express(); const path = require("path"); const fs = require("fs"); const cors = require("cors");

app.use(cors()); app.use(express.json()); app.use(express.urlencoded({ extended: true }));

// Load environment variables require("dotenv").config();

// Serve static frontend files from public folder app.use(express.static(path.join(__dirname, "public")));

// --- Correct Route Imports --- // Match with the actual file names in your routes folder: const pairingRoutes = require("./routes/pairing"); const qrRoutes = require("./routes/qr");

// --- API Routes --- app.use("/api/pair", pairingRoutes); app.use("/api/qr", qrRoutes);

// --- Sessions folder must exist --- const sessionDir = path.join(__dirname, "sessions"); if (!fs.existsSync(sessionDir)) { fs.mkdirSync(sessionDir); }

// --- Fallback for unknown routes --- app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });

// --- Server start --- const PORT = process.env.PORT || 3000; app.listen(PORT, () => { console.log(✅ Server running on port ${PORT}); });

