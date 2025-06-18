const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const pairingRoutes = require('./routes/pairing');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'savage-session' }),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html'
    }
});

app.use('/api', pairingRoutes(client));

client.on('ready', () => console.log('✅ SAVAGE-XMD is ready'));
client.on('auth_failure', (msg) => console.error('❌ AUTH FAILED:', msg));
client.on('disconnected', (reason) => {
    console.log('⚠️ DISCONNECTED:', reason);
    client.destroy();
    client.initialize();
});

client.initialize();
app.listen(PORT, () => console.log(`🌐 Server running at http://localhost:${PORT}`));