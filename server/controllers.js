import path from 'node:path';
import { getDirectoryContents } from './services.js';
import { BASE_PATH } from './utils.js';

export async function listFiles(req, res) {
	const requestedPath = req.query.path || '';
	const fullPath = path.resolve(BASE_PATH, requestedPath);

	if (!fullPath.startsWith(BASE_PATH + path.sep) && fullPath !== BASE_PATH) {
		return res
			.status(403)
			.json({ error: 'Access denied: path is outside allowed directory' });
	}

	try {
		const content = await getDirectoryContents(fullPath);
		const relativePath = path.relative(BASE_PATH, fullPath);

		res.json({ path: relativePath, content });
	} catch (err) {
		console.error('listFiles error:', err);
		res
			.status(500)
			.json({ error: 'Failed to list directory', details: err.message });
	}
}
