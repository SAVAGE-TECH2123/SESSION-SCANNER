const express = require('express');
const router = express.Router();
const { Client, LocalAuth, useMultiFileAuthState } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const sessions = {};

router.post('/', async (req, res) => {
  const { number, method } = req.body;

  if (!number || !method) {
    return res.status(400).json({ error: 'Missing number or method' });
  }

  if (!['pairing', 'qr'].includes(method)) {
    return res.status(400).json({ error: 'Invalid method' });
  }

  try {
    const sessionId = `session-${number}`;
    if (sessions[sessionId]) {
      return res.status(400).json({ error: 'Session already started' });
    }

    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionId}`);

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: sessionId }),
      puppeteer: { headless: true },
      auth: state
    });

    sessions[
