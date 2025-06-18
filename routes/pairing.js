const express = require('express'); const fs = require('fs'); const path = require('path'); const { startSocket } = require('../sessions/startSocket');

const router = express.Router();

router.post('/generate', async (req, res) => { const { number } = req.body;

if (!number) return res.status(400).json({ error: 'Phone number is required.' });

const sessionFile = path.join(__dirname, ../sessions/${number}.json);

try { await startSocket(number); return res.status(200).json({ message: 'Session started.', url: /sessions/${number}.json }); } catch (err) { console.error(Error starting session for ${number}:, err); return res.status(500).json({ error: 'Failed to start session.' }); } });

module.exports = router;

