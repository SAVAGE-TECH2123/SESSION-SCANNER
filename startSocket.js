const {
  default: makeWASocket,
  useSingleFileAuthState,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  DisconnectReason
} = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// Helper to ensure 'sessions' folder exists
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

async function startSocket(phoneNumber = null) {
  const sessionFile = phoneNumber
    ? path.join(sessionsDir, `${phoneNumber}.json`)
    : null;

  const { state, saveState } = useSingleFileAuthState(
    sessionFile || path.join(sessionsDir, `qr-session-${Date.now()}.json`)
  );

  const { version } = await fetchLatestBaileysVersion();
  const store = makeInMemoryStore({});

  const sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    browser: ['SAVAGE-XMD', 'Safari', '1.0.0']
  });

  store.bind(sock.ev);
  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log('🔁 Reconnecting...');
        startSocket(phoneNumber); // Retry
      } else {
        console.log('❌ Logged out.');
      }
    }

    if (connection === 'open') {
      console.log(`✅ WhatsApp connected ${phoneNumber || 'via QR'}`);
    }
  });

  return sock;
}

module.exports = startSocket;
