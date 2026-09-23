const http = require('http');

const server = http.createServer((req, res) => {
  // Proxy request to localhost:3000
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Gateway Error connecting to port 3000: ' + err.message);
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(5173, () => {
  console.log('[Port Forwarder] Forwarding http://localhost:5173 -> http://localhost:3000');
});
