const fs = require("fs");
const path = require("path");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

async function startSocket(number, res) {
  const sessionDir = path.join(__dirname, "../sessions", number);

  // Ensure session folder exists
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  // Load and save auth state
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  // Initialize WhatsApp socket
  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    syncFullHistory: false,
  });

  // Save credentials on update
  sock.ev.on("creds.update", saveCreds);

  // Notify client when connection is open
  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
      res.json({
        success: true,
        message: `WhatsApp session started for ${number}`,
        sessionPath: `/sessions/${number}`,
      });
    }
  });
}

module.exports = startSocket;
