const axios = require('axios');

async function checkGitHub() {
  const url = 'https://api.github.com';

  try {
    const start = Date.now();
    const res = await axios.get(url, { timeout: 5000 });
    const responseTime = Date.now() - start;

    console.log('✅ GitHub responded with status:', res.status);
    console.log('📈 Response time:', responseTime, 'ms');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkGitHub();