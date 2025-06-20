const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const startSocket = require("./startSocket");
const qrRoute = require("./routes/qr");
const pairingRoute = require("./routes/pairing");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/qr", qrRoute);
app.use("/pair", pairingRoute);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start socket for each allowed number if present in env or scanned
const sessionsDir = path.join(__dirname, "sessions");
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

fs.readdirSync(sessionsDir).forEach(number => {
  const sessionPath = path.join(sessionsDir, number, "session.json");
  if (fs.existsSync(sessionPath)) {
    const sessionData = JSON.parse(fs.readFileSync(sessionPath));
    startSocket(sessionData, number);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Session Scanner server running on http://localhost:${PORT}`);
});
