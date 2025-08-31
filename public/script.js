function checkService(name, url, boxId) {
  const box = document.getElementById(boxId);

  fetch(url)
    .then(response => {
      updateBox(box, name, response.ok);
    })
    .catch(() => {
      updateBox(box, name, false);
    });
}

function updateBox(box, name, isUp) {
  const key = `${name}_lastDown`;
  if (isUp) {
    const lastDown = localStorage.getItem(key);
    const timeAgo = lastDown ? timeSince(new Date(lastDown)) : "never";
    box.innerHTML = `
      <div>✅ ${name} is <strong>UP</strong></div>
      <div>⏱ Last downtime: ${timeAgo} ago</div>
    `;
    box.className = "up";
  } else {
    localStorage.setItem(key, new Date().toISOString());
    box.innerHTML = `
      <div>❌ ${name} is <strong>DOWN</strong></div>
      <div>⏱ Last downtime: just now</div>
    `;
    box.className = "down";
  }
}

function timeSince(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 }
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""}`;
    }
  }
  return "just now";
}

// 🔍 Replace these with actual service URLs

// --- Auto-refresh and timer logic ---
const REFRESH_INTERVAL = 60; // seconds
let lastRefresh = new Date();
let nextRefresh = REFRESH_INTERVAL;

// Create timer display
const timerDiv = document.createElement('div');
timerDiv.style.marginBottom = "20px";
timerDiv.style.fontWeight = "bold";
document.body.insertBefore(timerDiv, document.querySelector('.dashboard'));

function refreshAllServices() {
  checkService("GitHub API", "https://api.github.com", "githubBox");
  checkService("Artifactory", "http://placeholder-artifactory.local", "artifactoryBox");
  checkService("SonarQube", "http://placeholder-sonarqube.local", "sonarqubeBox");
  checkService("Azure DevOps", "http://placeholder-azure.local", "azureBox");
  checkService("Zabbix", "http://placeholder-zabbix.local", "zabbixBox");
  lastRefresh = new Date();
  nextRefresh = REFRESH_INTERVAL;
  updateTimer();
}

function updateTimer() {
  const now = new Date();
  const secondsSinceRefresh = Math.floor((now - lastRefresh) / 1000);
  timerDiv.textContent = `⏳ Last refresh: ${lastRefresh.toLocaleTimeString()} | Next refresh in: ${nextRefresh} second${nextRefresh !== 1 ? "s" : ""}`;
}

// Initial load
refreshAllServices();
updateTimer();

// Auto-refresh every 1 minute
setInterval(() => {
  refreshAllServices();
}, REFRESH_INTERVAL * 1000);

// Update timer every second
setInterval(() => {
  nextRefresh--;
  if (nextRefresh < 0) nextRefresh = 0;
  updateTimer();
}, 1000);
