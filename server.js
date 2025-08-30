const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Serve frontend files

const db = new sqlite3.Database('./monitor.db');

db.run(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service TEXT,
    time INTEGER,
    responseTime INTEGER
  )
`);

let latestStatus = [];

async function checkGitHub() {
  const url = 'https://api.github.com';

  try {
    const start = Date.now();
    const res = await axios.get(url, { timeout: 5000 });
    const responseTime = Date.now() - start;

    return {
      name: 'GitHub',
      url,
      status: 'up',
      uptimePercent: '100.00',
      avgResponseTime: responseTime
    };
  } catch (err) {
    return {
      name: 'GitHub',
      url,
      status: 'down',
      uptimePercent: '99.00',
      avgResponseTime: null
    };
  }
}

async function updateStatus() {
  const timestamp = Date.now();
  const github = await checkGitHub();

  latestStatus = [github];

  db.run(
    `INSERT INTO history (service, time, responseTime) VALUES (?, ?, ?)`,
    ['GitHub', timestamp, github.avgResponseTime]
  );
}

setInterval(updateStatus, 60 * 1000); // every minute

app.get('/status', (req, res) => {
  res.json(latestStatus);
});

app.get('/history', (req, res) => {
  db.all(`SELECT * FROM history ORDER BY time ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const grouped = {};
    rows.forEach(row => {
      if (!grouped[row.service]) {
        grouped[row.service] = [];
      }
      grouped[row.service].push({ time: row.time, responseTime: row.responseTime });
    });

    res.json(grouped);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
