const https = require('https');

const options = {
  hostname: 'api.github.com',
  path: '/repos/mycloseclaw/ai-daily-news/contents/news',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed.slice(0, 3), null, 2));
    } catch (e) {
      console.log('Error:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();
