// Controller logic for file/folder operations
import fs from 'fs/promises';
import path from 'path';

// List directory contents (GET /api/files?dir=/some/path)
export async function listDirectory(req, res) {
	const dir =
		req.query.dir || '/data/data/com.termux/files/home/storage/shared';
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
	const { dir, q } = req.query;
	try {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		const files = entries
			.filter((entry) => entry.name.toLowerCase().includes(q.toLowerCase()))
			.map((entry) => ({
				name: entry.name,
				isDirectory: entry.isDirectory(),
				isFile: entry.isFile(),
			}));
		res.json({ path: dir, files });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
