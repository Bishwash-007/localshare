import express from 'express';
import path from 'node:path';
import os from 'node:os';
import cors from 'cors';
import { fileURLToPath } from 'url';

import apiRouter from './routes.js';

const app = express();

function getLocalIp() {
	const nets = os.networkInterfaces();
	for (const name of Object.keys(nets)) {
		for (const net of nets[name] || []) {
			if (
				net.family === 'IPv4' &&
				!net.internal &&
				net.address.startsWith('192.')
			) {
				return net.address;
			}
		}
	}
	return 'localhost';
}

const ipAddress = getLocalIp();
console.log(`Server IP address: ${ipAddress}`);

// app.use(compression());
app.use(express.json());

app.use(
	cors({
		origin: ['http://localhost:5173', 'http://192.168.1.77:8080'],
		credentials: true,
	}),
);

// static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname);
app.use(express.static(path.join(__dirname, '../vite/dist')));
app.use('/api', apiRouter);

app.get('/{*path}', (req, res) => {
	res.sendFile(path.join(__dirname, '../vite/dist/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: 'Internal Server Error' });
});

// Server
const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
	console.log(`Server running on http://${ipAddress}:${PORT}`);
});
