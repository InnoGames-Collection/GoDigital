import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3703;
const API_URL = process.env.API_URL || (process.env.NODE_ENV === 'production' ? 'http://godigital-api:3702' : 'http://127.0.0.1:3702');

function proxyToBackend(apiBaseUrl) {
  const parsedTarget = new URL(apiBaseUrl);

  return (req, res) => {
    const targetUrl = new URL(req.originalUrl, apiBaseUrl);
    const headers = { ...req.headers };
    headers.host = parsedTarget.host;

    const proxyReq = http.request(
      targetUrl,
      {
        method: req.method,
        headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      console.error('[Admin Reverse Proxy Error]', err.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: 'BAD_GATEWAY',
          message: 'GoDigital Fastify API backend unavailable',
          detail: err.message,
        });
      }
    });

    req.pipe(proxyReq);
  };
}

// Reverse Proxy for API requests to Fastify Backend (Port 3702)
app.use('/api', proxyToBackend(API_URL));

// Static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'godigital-admin',
    backendTarget: API_URL,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GoDigital Admin Console running on port ${PORT} -> Forwarding /api to ${API_URL}`);
});
