const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Public folder (for index.html and frontend)
app.use(express.static('public'));
app.use(express.json());

// ✅ Allow bot to fetch session file via HTTP
app.get('/sessions/:sessionId.json', (req, res) => {
  const sessionId = req.params.sessionId;
  const filePath = path.join(__dirname, 'sessions', `${sessionId}.json`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Homepage (scanner interface)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Session scanner running on http://localhost:${PORT}`);
});
