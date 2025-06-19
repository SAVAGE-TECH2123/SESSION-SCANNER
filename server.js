// 📁 server.js const express = require('express'); const cors = require('cors'); const path = require('path');

const app = express(); const PORT = process.env.PORT || 3000;

app.use(cors()); app.use(express.json()); app.use(express.static(path.join(__dirname, 'public')));

// Simple pairing endpoint app.post('/generate-session', (req, res) => { const { number } = req.body; if (!number) return res.status(400).json({ error: 'Phone number is required' }); res.json({ message: Session generated for ${number} }); });

app.listen(PORT, () => { console.log(✅ Server running on http://localhost:${PORT}); });

