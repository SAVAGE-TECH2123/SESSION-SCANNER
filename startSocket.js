// ✅ startSocket.js const fs = require("fs"); const path = require("path"); const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");

async function startSocket(number, res) { const sessionDir = path.join(__dirname, "../sessions", number); if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

const { state, saveCreds } = await useMultiFileAuthState(sessionDir); const { version } = await fetchLatestBaileysVersion();

const sock = makeWASocket({ version, auth: state, printQRInTerminal: true, syncFullHistory: false, });

sock.ev.on("creds.update", saveCreds);

sock.ev.on("connection.update", ({ connection }) => { if (connection === "open") { res.json({ success: true, message: "Session created successfully!", sessionId: number, }); } }); }

module.exports = startSocket;

