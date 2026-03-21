// Main entry point — wires all components together.
// Handles: sidebar nav, storage meter, API event responses,
// upload progress, and initial load.

//  Sidebar Nav ─
const SidebarNav = (() => {
	const items = document.querySelectorAll('.folder');
	// Map sidebar labels to paths (adjust to match your BASE_DIR structure)
	const PATH_MAP = {
		Documents: 'Documents',
		Music: 'Music',
		Videos: 'Videos',
		DCIM: 'DCIM',
		Downloads: 'Downloads',
		Device: '',
		'External Card': '',
	};

	function init() {
		items.forEach((item) => {
			const label = item.textContent.trim();
			item.addEventListener('click', async () => {
				const path = PATH_MAP[label] ?? '';
				// Check if folder exists before navigating
				try {
					const res = await fetch(`/api/files?dir=${encodeURIComponent(path)}`);
					if (res.ok) {
						document.dispatchEvent(
							new CustomEvent('navigate', { detail: { path } }),
						);
					} else {
						FileList.showToast('Folder not found', 'err');
					}
				} catch {
					FileList.showToast('Folder not found', 'err');
				}
			});
		});
	}

	function setActive(path) {
		items.forEach((item) => {
			item.classList.remove('sidebar__item--active');
			const label = item.textContent.trim();
			const itemPath = PATH_MAP[label] ?? null;
			if (itemPath === path || (path === '' && label === 'Device')) {
				item.classList.add('sidebar__item--active');
			}
		});
	}

	init();
	return { setActive };
})();

//  Storage Meter ─
async function loadStorageMeter() {
	try {
		const res = await fetch('/api/storage');
		const data = await res.json();
		const fill = document.querySelector('.storage-meter__fill');
		const labels = document.querySelectorAll('.storage-meter__labels span');

		if (data.total > 0) {
			const pct = Math.round((data.used / data.total) * 100);
			if (fill) fill.style.width = pct + '%';
			const fmt = (n) =>
				n < 1e9 ? (n / 1e6).toFixed(1) + ' MB' : (n / 1e9).toFixed(1) + ' GB';
			if (labels[0]) labels[0].textContent = fmt(data.used) + ' used';
			if (labels[1]) labels[1].textContent = fmt(data.total);
		}
	} catch {
		// silently fail — storage info is cosmetic
	}
}

//  Directory loader
async function loadDirectory(path) {
	try {
		const res = await fetch(`/api/files?dir=${encodeURIComponent(path)}`);
		const data = await res.json();
		if (data.error) {
			FileList.showToast(data.error, 'err');
			return;
		}
		FileList.render(data.files || []);
		updateConnectionStatus(true);
	} catch {
		FileList.showToast('Failed to connect to server', 'err');
		updateConnectionStatus(false);
	}
}

//  API event handlers (you fill these in)

// Rename
document.addEventListener('file:rename', async (e) => {
	const { oldPath, newPath, currentPath } = e.detail;
	const res = await fetch('/api/files/rename', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ oldPath, newPath }),
	});
	const data = await res.json();
	if (data.success) {
		loadDirectory(currentPath);
		FileList.showToast(`Renamed to "${newPath}"`, 'ok');
	} else {
		FileList.showToast(data.error || 'Rename failed', 'err');
	}
});

// Delete
document.addEventListener('file:delete', async (e) => {
	const { targetPath, isFolder, currentPath } = e.detail;
	const res = await fetch('/api/files/delete', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ targetPath, isFolder }),
	});
	const data = await res.json();
	if (data.success) {
		loadDirectory(currentPath);
		FileList.showToast('Deleted', 'ok');
	} else {
		FileList.showToast(data.error || 'Delete failed', 'err');
	}
});

// Paste (copy or move)
document.addEventListener('file:paste', async (e) => {
	const { srcPath, destPath, mode, currentPath } = e.detail;
	const endpoint = mode === 'cut' ? '/api/files/move' : '/api/files/copy';
	const res = await fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ src: srcPath, dest: destPath }),
	});
	const data = await res.json();
	if (data.success) {
		loadDirectory(currentPath);
		FileList.showToast(
			`${mode === 'cut' ? 'Moved' : 'Copied'} successfully`,
			'ok',
		);
	} else {
		FileList.showToast(
			data.error || `${mode === 'cut' ? 'Move' : 'Copy'} failed`,
			'err',
		);
	}
});

// Mkdir
document.addEventListener('file:mkdir', async (e) => {
	const { name, currentPath } = e.detail;
	const res = await fetch('/api/files/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ dir: currentPath, name, isFolder: true }),
	});
	const data = await res.json();
	if (data.success) {
		loadDirectory(currentPath);
		FileList.showToast(`Created "${name}"`, 'ok');
	} else {
		FileList.showToast(data.error || 'Create folder failed', 'err');
	}
});

// Upload with progress
document.addEventListener('file:upload', async (e) => {
	const { files, currentPath } = e.detail;
	if (!files.length) return;

	// Build a simple progress UI
	const prog = createProgressBar();
	document.body.appendChild(prog.el);

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		prog.setLabel(`${i + 1}/${files.length} — ${file.name}`);
		prog.setProgress(0);

		const fd = new FormData();
		fd.append('file', file);

		await new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.upload.onprogress = (ev) => {
				if (ev.lengthComputable) prog.setProgress((ev.loaded / ev.total) * 100);
			};
			xhr.onload = resolve;
			xhr.onerror = reject;
			xhr.open('POST', `/api/files/upload`);
			xhr.send(fd);
		}).catch(() => FileList.showToast(`Failed to upload ${file.name}`, 'err'));
	}

	prog.el.remove();
	loadDirectory(currentPath);
	FileList.showToast(
		`Uploaded ${files.length} file${files.length > 1 ? 's' : ''}`,
		'ok',
	);
});

// Navigate — scripts.js owns this since all globals are available here
document.addEventListener('navigate', (e) => {
	Breadcrumbs.render(e.detail.path);
	SidebarNav.setActive(e.detail.path);
});

// dir:load fires from fileList.js after it updates currentPath
document.addEventListener('dir:load', (e) => {
	loadDirectory(e.detail.path);
});

//  Progress bar factory
function createProgressBar() {
	const el = document.createElement('div');
	el.style.cssText = `
    position:fixed;bottom:48px;right:24px;
    background:var(--ctp-mantle);border:1px solid var(--ctp-mauve);
    border-radius:10px;padding:14px 18px;z-index:9999;min-width:240px;
    box-shadow:0 0 24px rgba(203,166,247,0.15);font-family:var(--font-mono);`;
	el.innerHTML = `
    <div id="_up_label" style="font-size:0.75rem;color:var(--ctp-subtext1);margin-bottom:8px;">Uploading…</div>
    <div style="height:4px;background:var(--ctp-surface0);border-radius:9999px;overflow:hidden;">
      <div id="_up_fill" style="height:100%;background:linear-gradient(90deg,var(--ctp-blue),var(--ctp-mauve));
           border-radius:9999px;transition:width 0.3s;width:0%;"></div>
    </div>`;
	return {
		el,
		setLabel: (text) => {
			el.querySelector('#_up_label').textContent = text;
		},
		setProgress: (pct) => {
			el.querySelector('#_up_fill').style.width = pct + '%';
		},
	};
}

//  Connection status ─
function updateConnectionStatus(online) {
	const statusEl = document.getElementById('connection-status');
	if (!statusEl) return;
	statusEl.innerHTML = online
		? `<i class="ph ph-wifi-high"></i> Connected`
		: `<i class="ph ph-wifi-slash"></i> Disconnected`;
	statusEl.style.color = online ? 'var(--ctp-green)' : 'var(--ctp-red)';
}

//  Init
(function init() {
	loadStorageMeter();
	loadDirectory(''); // load root on startup
	SidebarNav.setActive(''); // highlight "Device" by default

	// Refresh storage meter every 30s
	setInterval(loadStorageMeter, 30_000);
})();
