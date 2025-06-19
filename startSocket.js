const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  useSingleFileLegacyAuthState,
  makeInMemoryStore
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode");
const fs = require("fs");
const path = require("path");

const sessionsDir = path.join(__dirname, "..", "sessions");

if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir);
}

async function startSocket(id, method, phoneNumber) {
  const sessionPath = path.join(sessionsDir, `${id}`);

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, fs.existsSync(sessionPath)),
    },
    printQRInTerminal: false,
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  return new Promise((resolve, reject) => {
    sock.ev.on("connection.update", async (update) => {
      const { connection, qr } = update;

      if (qr && method === "QRCode") {
        try {
          const qrImage = await qrcode.toDataURL(qr);
          resolve({ status: "QR", image: qrImage });
        } catch (err) {
          reject({ error: "Failed to generate QR code." });
        }
      }

      if (method === "PairingCode" && connection === "open") {
        resolve({ status: "CONNECTED", message: "Paired successfully." });
      }

      if (update.pairingCode && method === "PairingCode") {
        resolve({
          status: "PAIRING",
          code: update.pairingCode,
        });
      }

      if (connection === "close") {
        const reason = update.lastDisconnect?.error?.output?.statusCode;
        if (reason !== DisconnectReason.loggedOut) {
          console.log("Reconnecting...");
          startSocket(id, method, phoneNumber);
        } else {
          reject({ error: "Disconnected and logged out." });
        }
      }
    });
  });
}

module.exports = startSocket;
