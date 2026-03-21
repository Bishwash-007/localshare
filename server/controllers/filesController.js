import os from 'os';
// Storage meter (GET /api/storage)
export async function storage(req, res) {
	try {
		// Use 'df' command for cross-platform disk usage (works in Termux)
		const { exec } = await import('child_process');
		exec(
			'df -k /data/data/com.termux/files/home/storage/shared',
			(err, stdout) => {
				if (err) return res.status(500).json({ error: err.message });
				const lines = stdout.trim().split('\n');
				if (lines.length < 2)
					return res.status(500).json({ error: 'No disk info' });
				const parts = lines[1].split(/\s+/);
				const total = parseInt(parts[1], 10) * 1024;
				const used = parseInt(parts[2], 10) * 1024;
				res.json({ total, used });
			},
		);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
// Move file or folder (POST /api/files/move)
export async function move(req, res) {
	const { src, dest } = req.body;
	try {
		await fs.rename(src, dest);
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Copy file or folder (POST /api/files/copy)
export async function copy(req, res) {
	const { src, dest } = req.body;
	try {
		// Only support file copy for now
		const stat = await fs.stat(src);
		if (stat.isDirectory()) {
			return res
				.status(400)
				.json({ error: 'Copying folders is not supported yet.' });
		}
		const data = await fs.readFile(src);
		await fs.writeFile(dest, data);
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
// Controller logic for file/folder operations
import fs from 'fs/promises';
import path from 'path';

// List directory contents (GET /api/files?dir=/some/path)
export async function listDirectory(req, res) {
	// Use /storage as root if dir is empty or "/"
	let dir = req.query.dir;
	if (!dir || dir === '/') {
		dir = '/data/data/com.termux/files/home/storage';
	}
	try {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		const files = entries
			.filter((entry) => !entry.name.startsWith('.')) // Hide dotfiles
			.map((entry) => ({
				name: entry.name,
				isDirectory: entry.isDirectory(),
				isFile: entry.isFile(),
			}));
		res.json({ path: dir, files });
	} catch (err) {
		if (err.code === 'ENOENT') {
			res.status(404).json({ error: 'Folder not found' });
		} else {
			res.status(500).json({ error: err.message });
		}
	}
}

// Create file or folder (POST /api/files/create)
export async function create(req, res) {
	const { dir, name, isFolder } = req.body;
	const targetPath = path.join(dir, name);
	try {
		if (isFolder) {
			await fs.mkdir(targetPath);
		} else {
			await fs.writeFile(targetPath, '');
		}
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Delete file or folder (DELETE /api/files/delete)
export async function remove(req, res) {
	const { targetPath, isFolder } = req.body;
	try {
		if (isFolder) {
			await fs.rmdir(targetPath, { recursive: true });
		} else {
			await fs.unlink(targetPath);
		}
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Rename file or folder (POST /api/files/rename)
export async function rename(req, res) {
	const { oldPath, newPath } = req.body;
	try {
		await fs.rename(oldPath, newPath);
		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Download file (GET /api/files/download?path=...)
export async function download(req, res) {
	const file = req.query.path;
	if (!file) return res.status(400).json({ error: 'No file specified' });
	try {
		res.download(file);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Upload file (POST /api/files/upload)
// (Requires multer middleware in route)
export async function upload(req, res) {
	// File is already saved by multer
	res.json({ success: true, file: req.file });
}

// Search files/folders (GET /api/files/search?dir=...&q=...)
export async function search(req, res) {
	let dir = req.query.dir;
	if (!dir || dir === '/') {
		dir = '/data/data/com.termux/files/home/storage';
	}
	const q = req.query.q || '';
	try {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		const results = entries
			.filter(
				(entry) =>
					!entry.name.startsWith('.') &&
					entry.name.toLowerCase().includes(q.toLowerCase()),
			)
			.map((entry) => ({
				name: entry.name,
				isDirectory: entry.isDirectory(),
				isFile: entry.isFile(),
			}));
		res.json({ path: dir, results });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
