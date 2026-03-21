import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

import apiRouter from './api/index.js';

const app = express();

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}
const ipAddress = getLocalIp();
console.log(`Server IP address: ${ipAddress}`);
// Serve static frontend
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../client')));

// API routes
app.use('/api', apiRouter);

// Listen on all interfaces for Termux/mobile access
const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on http://${ipAddress}:${PORT}`);
});
