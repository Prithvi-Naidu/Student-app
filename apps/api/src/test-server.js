const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', node: process.version });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`Node version: ${process.version}`);
});

