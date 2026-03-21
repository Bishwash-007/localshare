// ============================================================
// fileList.js
// Renders the file grid, handles selection, context menu,
// drag-and-drop upload, and coordinates with other components.
// ============================================================

const FileList = (() => {
	const grid = document.getElementById('file-list');
	const itemCountEl = document.getElementById('item-count');

	let currentPath = '';
	let currentItems = [];
	let selectedItem = null;
	let clipboard = null; // { item, srcPath, mode: "copy"|"cut" }
	let currentView = 'grid'; // "grid" | "list"

	//  Icon helpers ─
	const EXT_ICON = {
		// folder handled separately
		jpg: ['ph-image-square', 'image'],
		jpeg: ['ph-image-square', 'image'],
		png: ['ph-image-square', 'image'],
		gif: ['ph-gif', 'image'],
		webp: ['ph-image-square', 'image'],
		svg: ['ph-image-square', 'image'],
		mp4: ['ph-film-strip', 'video'],
		mkv: ['ph-film-strip', 'video'],
		mov: ['ph-film-strip', 'video'],
		avi: ['ph-film-strip', 'video'],
		mp3: ['ph-music-note', 'audio'],
		wav: ['ph-music-note', 'audio'],
		flac: ['ph-music-note', 'audio'],
		aac: ['ph-music-note', 'audio'],
		pdf: ['ph-file-pdf', 'doc'],
		zip: ['ph-file-zip', 'archive'],
		rar: ['ph-file-zip', 'archive'],
		gz: ['ph-file-zip', 'archive'],
		tar: ['ph-file-zip', 'archive'],
		py: ['ph-file-code', 'doc'],
		js: ['ph-file-js', 'doc'],
		ts: ['ph-file-ts', 'doc'],
		tsx: ['ph-file-tsx', 'doc'],
		jsx: ['ph-file-jsx', 'doc'],
		sh: ['ph-terminal-window', 'doc'],
		md: ['ph-file-text', 'doc'],
		txt: ['ph-file-text', 'doc'],
		xlsx: ['ph-file-xls', 'doc'],
		csv: ['ph-file-csv', 'doc'],
	};

	function getIcon(item) {
		if (item.is_dir) return { ph: 'ph-folder', cardClass: 'file-card--folder' };
		const ext = item.name.split('.').pop().toLowerCase();
		const entry = EXT_ICON[ext];
		if (!entry) return { ph: 'ph-file', cardClass: 'file-card--doc' };
		return { ph: entry[0], cardClass: `file-card--${entry[1]}` };
	}

	//  Render
	function render(items) {
		currentItems = items;
		if (!grid) return;
		closeCtxMenu();

		if (items.length === 0) {
			grid.innerHTML = `
        <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;
                    justify-content:center;gap:12px;padding:60px 20px;color:var(--ctp-overlay1);">
          <i class="ph ph-folder-open" style="font-size:4rem;opacity:0.4;"></i>
          <p style="font-size:0.875rem;">This folder is empty</p>
        </div>`;
			updateFooter(0);
			return;
		}

		const sorted = [...items].sort((a, b) => {
			if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
			return a.name.localeCompare(b.name);
		});

		grid.innerHTML = sorted.map((item, i) => renderCard(item, i)).join('');
		bindCardEvents();
		updateFooter(sorted.length);
	}

	function renderCard(item, i) {
		const { ph, cardClass } = getIcon(item);
		const isCut =
			clipboard?.mode === 'cut' &&
			clipboard.item.name === item.name &&
			clipboard.srcPath === currentPath;

		// image thumbnail?
		const ext = item.name.split('.').pop().toLowerCase();
		const isImage =
			['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) && !item.is_dir;
		const iconOrThumb = isImage
			? `<img src="/api/download?path=${encodeURIComponent((currentPath ? currentPath + '/' : '') + item.name)}"
              alt="${esc(item.name)}" class="file-card__thumbnail"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
         <i class="ph ${ph} file-card__icon" style="display:none;"></i>`
			: `<i class="ph ${ph} file-card__icon"></i>`;

		return `
      <div class="file-card ${cardClass} ${isCut ? 'file-card--cut' : ''}"
           tabindex="0"
           data-index="${i}"
           data-name="${esc(item.name)}"
           data-is-dir="${item.is_dir}"
           style="${isCut ? 'opacity:0.45;' : ''}animation:fadeUp 0.15s ease ${i * 0.02}s both;">
        ${iconOrThumb}
        <div class="file-card__meta">
          <span class="file-card__name" title="${esc(item.name)}">${esc(item.name)}</span>
          <span class="file-card__detail">
            ${item.is_dir ? (item.child_count != null ? item.child_count + ' items' : 'Folder') : item.size_fmt || ''}
          </span>
        </div>
        <button class="file-card__menu-btn" title="More options" data-index="${i}">
          <i class="ph ph-dots-three"></i>
        </button>
      </div>`;
	}

	//  Render search results ─
	function renderSearchResults(results, q) {
		currentItems = results;
		if (!grid) return;
		closeCtxMenu();

		if (results.length === 0) {
			grid.innerHTML = `
        <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;
                    gap:12px;padding:60px 20px;color:var(--ctp-overlay1);">
          <i class="ph ph-magnifying-glass" style="font-size:4rem;opacity:0.4;"></i>
          <p style="font-size:0.875rem;">No results for "<strong style="color:var(--ctp-text);">${esc(q)}</strong>"</p>
        </div>`;
			updateFooter(0);
			return;
		}

		const re = new RegExp(`(${escRe(q)})`, 'gi');

		grid.innerHTML = results
			.map((item, i) => {
				const { ph, cardClass } = getIcon(item);
				const highlightedName = esc(item.name).replace(
					re,
					`<mark style="background:rgba(203,166,247,0.25);color:var(--ctp-mauve);border-radius:2px;">$1</mark>`,
				);
				return `
        <div class="file-card ${cardClass}" tabindex="0" data-index="${i}"
             data-name="${esc(item.name)}" data-is-dir="${item.is_dir}"
             data-full-path="${esc(item.full_path || item.name)}"
             style="animation:fadeUp 0.15s ease ${i * 0.02}s both;">
          <i class="ph ${ph} file-card__icon"></i>
          <div class="file-card__meta">
            <span class="file-card__name" title="${esc(item.name)}">${highlightedName}</span>
            <span class="file-card__detail" style="font-size:0.7rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;">
              ${esc(item.full_path || '')}
            </span>
          </div>
          <button class="file-card__menu-btn" title="More options" data-index="${i}">
            <i class="ph ph-dots-three"></i>
          </button>
        </div>`;
			})
			.join('');

		bindCardEvents();
		updateFooter(results.length, `Results for "${q}"`);
	}

	//  Card events ─
	function bindCardEvents() {
		grid?.querySelectorAll('.file-card').forEach((card) => {
			const i = parseInt(card.dataset.index);

			// Single click → select
			card.addEventListener('click', (e) => {
				if (e.target.closest('.file-card__menu-btn')) return;
				selectCard(card, i);
			});

			// Double click → open
			card.addEventListener('dblclick', (e) => {
				if (e.target.closest('.file-card__menu-btn')) return;
				openItem(i, card);
			});

			// Enter key
			card.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') openItem(i, card);
				if (e.key === ' ') {
					e.preventDefault();
					selectCard(card, i);
				}
			});

			// Right-click context menu
			card.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				selectCard(card, i);
				showCtxMenu(e.clientX, e.clientY, i);
			});
		});

		// Three-dot menu buttons
		grid?.querySelectorAll('.file-card__menu-btn').forEach((btn) => {
			btn.addEventListener('click', (e) => {
				e.stopPropagation();
				const i = parseInt(btn.dataset.index);
				const card = grid.querySelector(`[data-index="${i}"]`);
				if (card) selectCard(card, i);
				const rect = btn.getBoundingClientRect();
				showCtxMenu(rect.left, rect.bottom + 4, i);
			});
		});
	}

	function selectCard(card, i) {
		grid
			?.querySelectorAll('.file-card')
			.forEach((c) => (c.style.background = ''));
		card.style.background = 'var(--ctp-surface0)';
		card.style.borderColor = 'var(--ctp-blue)';
		grid?.querySelectorAll('.file-card').forEach((c) => {
			if (c !== card) {
				c.style.borderColor = '';
			}
		});
		selectedItem = {
			...currentItems[i],
			index: i,
			path: buildPath(currentItems[i]),
		};
	}

	function openItem(i, card) {
		const item = currentItems[i];
		if (!item) return;
		if (item.is_dir) {
			const newPath =
				item.full_path ||
				(currentPath ? currentPath + '/' + item.name : item.name);
			document.dispatchEvent(
				new CustomEvent('navigate', { detail: { path: newPath } }),
			);
		} else {
			PreviewModal.open({ ...item, path: item.full_path || buildPath(item) });
		}
	}

	function buildPath(item) {
		if (item.full_path) return item.full_path;
		return currentPath ? currentPath + '/' + item.name : item.name;
	}

	//  Context menu
	let ctxMenu = null;

	function showCtxMenu(x, y, i) {
		closeCtxMenu();
		const item = currentItems[i];
		if (!item) return;

		const menu = document.createElement('div');
		menu.id = 'ctx-menu';
		menu.style.cssText = `
      position:fixed;left:${x}px;top:${y}px;
      background:var(--ctp-mantle);border:1px solid var(--ctp-surface1);
      border-radius:10px;padding:5px;min-width:190px;z-index:9999;
      box-shadow:0 8px 32px rgba(0,0,0,0.5);
      animation:ctxIn 0.12s ease;`;

		const actions = [
			item.is_dir
				? { icon: 'ph-folder-open', label: 'Open', action: () => openItem(i) }
				: {
						icon: 'ph-eye',
						label: 'Preview',
						action: () => PreviewModal.open({ ...item, path: buildPath(item) }),
					},
			!item.is_dir
				? {
						icon: 'ph-download-simple',
						label: 'Download',
						action: () => downloadItem(item),
					}
				: null,
			'sep',
			{
				icon: 'ph-pencil-simple',
				label: 'Rename',
				action: () => promptRename(item),
			},
			{ icon: 'ph-copy', label: 'Copy', action: () => copyItem(item, 'copy') },
			{
				icon: 'ph-scissors',
				label: 'Cut',
				action: () => copyItem(item, 'cut'),
			},
			clipboard
				? { icon: 'ph-clipboard', label: 'Paste', action: () => pasteItem() }
				: null,
			'sep',
			{ icon: 'ph-info', label: 'Get Info', action: () => showInfo(item) },
			'sep',
			{
				icon: 'ph-trash',
				label: 'Delete',
				action: () => promptDelete(item),
				danger: true,
			},
		].filter(Boolean);

		menu.innerHTML = actions
			.map((a) => {
				if (a === 'sep')
					return `<div style="height:1px;background:var(--ctp-surface0);margin:4px 0;"></div>`;
				return `
        <div class="ctx-item" style="
          display:flex;align-items:center;gap:10px;padding:7px 10px;
          border-radius:6px;cursor:pointer;font-size:0.8125rem;
          color:${a.danger ? 'var(--ctp-red)' : 'var(--ctp-text)'};
          transition:background 0.1s;">
          <i class="ph ${a.icon}" style="font-size:1rem;width:16px;text-align:center;
            color:${a.danger ? 'var(--ctp-red)' : 'var(--ctp-overlay2)'}"></i>
          ${a.label}
        </div>`;
			})
			.join('');

		document.body.appendChild(menu);
		ctxMenu = menu;

		// Bind action clicks
		const items = menu.querySelectorAll('.ctx-item');
		actions
			.filter((a) => a !== 'sep')
			.forEach((a, idx) => {
				items[idx]?.addEventListener('click', () => {
					closeCtxMenu();
					a.action();
				});
				items[idx]?.addEventListener(
					'mouseover',
					() => (items[idx].style.background = 'var(--ctp-surface0)'),
				);
				items[idx]?.addEventListener(
					'mouseout',
					() => (items[idx].style.background = ''),
				);
			});

		// Flip if out of viewport
		requestAnimationFrame(() => {
			const r = menu.getBoundingClientRect();
			if (r.right > window.innerWidth) menu.style.left = x - r.width + 'px';
			if (r.bottom > window.innerHeight) menu.style.top = y - r.height + 'px';
		});
	}

	function closeCtxMenu() {
		ctxMenu?.remove();
		ctxMenu = null;
	}

	document.addEventListener('click', () => closeCtxMenu());
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') closeCtxMenu();
	});

	//  File actions (stubs — API calls written by you) ─

	function downloadItem(item) {
		window.location = `/api/download?path=${encodeURIComponent(buildPath(item))}`;
	}

	function promptRename(item) {
		const newName = prompt('Rename:', item.name);
		if (!newName || newName === item.name) return;
		document.dispatchEvent(
			new CustomEvent('file:rename', {
				detail: { path: buildPath(item), newName, currentPath },
			}),
		);
	}

	function copyItem(item, mode) {
		clipboard = { item: { ...item }, srcPath: currentPath, mode };
		showToast(`${mode === 'cut' ? 'Cut' : 'Copied'} "${item.name}"`, 'info');
		if (mode === 'cut') render(currentItems); // show faded
	}

	function pasteItem() {
		if (!clipboard) return;
		const { item, srcPath, mode } = clipboard;
		const destPath = currentPath ? currentPath + '/' + item.name : item.name;
		document.dispatchEvent(
			new CustomEvent('file:paste', {
				detail: { srcPath: buildPath(item), destPath, mode, currentPath },
			}),
		);
		if (mode === 'cut') clipboard = null;
	}

	function promptDelete(item) {
		if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
		document.dispatchEvent(
			new CustomEvent('file:delete', {
				detail: { path: buildPath(item), currentPath },
			}),
		);
	}

	function showInfo(item) {
		PreviewModal.open({
			...item,
			path: buildPath(item),
			_infoOnly: true,
		});
		// Override modal body with info table
		setTimeout(() => {
			const body = document.getElementById('preview-content');
			if (!body) return;
			body.innerHTML = `
        <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
          ${infoRow('Name', item.name)}
          ${infoRow('Type', item.type || (item.is_dir ? 'Folder' : 'File'))}
          ${infoRow('Size', item.size_fmt || '—')}
          ${infoRow('Modified', item.modified || '—')}
          ${infoRow('Path', buildPath(item))}
        </table>`;
		}, 0);
	}

	function infoRow(label, value) {
		return `<tr>
      <td style="padding:10px 0;color:var(--ctp-overlay1);width:80px;vertical-align:top;font-size:0.75rem;">${label}</td>
      <td style="padding:10px 0;color:var(--ctp-text);word-break:break-all;">${esc(String(value))}</td>
    </tr>`;
	}

	//  Footer
	function updateFooter(count, label) {
		if (itemCountEl) {
			itemCountEl.innerHTML = `<i class="ph ph-files"></i> ${label || count + ' item' + (count !== 1 ? 's' : '')}`;
		}
	}

	//  Drag & drop upload
	const contentArea = document.querySelector('.content-area');

	contentArea?.addEventListener('dragover', (e) => {
		e.preventDefault();
		contentArea.style.outline = '2px dashed var(--ctp-mauve)';
		contentArea.style.background = 'rgba(203,166,247,0.04)';
	});

	contentArea?.addEventListener('dragleave', () => {
		contentArea.style.outline = '';
		contentArea.style.background = '';
	});

	contentArea?.addEventListener('drop', (e) => {
		e.preventDefault();
		contentArea.style.outline = '';
		contentArea.style.background = '';
		const files = e.dataTransfer.files;
		if (files.length) {
			document.dispatchEvent(
				new CustomEvent('file:upload', {
					detail: { files, currentPath },
				}),
			);
		}
	});

	//  View toggle ─
	document
		.querySelectorAll(
			".icon-btn[title='Grid View'], .icon-btn[title='List View']",
		)
		.forEach((btn) => {
			btn.addEventListener('click', () => {
				const isGrid = btn.title === 'Grid View';
				currentView = isGrid ? 'grid' : 'list';
				document
					.querySelectorAll(
						".icon-btn[title='Grid View'], .icon-btn[title='List View']",
					)
					.forEach((b) => b.classList.toggle('icon-btn--active', b === btn));
				// Toggle grid columns for list view
				if (grid) {
					grid.style.gridTemplateColumns = isGrid
						? 'repeat(auto-fill, minmax(140px, 1fr))'
						: '1fr';
				}
			});
		});

	//  New folder button ─
	document
		.querySelector(".icon-btn[title='New Folder']")
		?.addEventListener('click', () => {
			const name = prompt('Folder name:', 'New Folder');
			if (!name) return;
			document.dispatchEvent(
				new CustomEvent('file:mkdir', {
					detail: { name, currentPath },
				}),
			);
		});

	//  Keyboard shortcuts
	document.addEventListener('keydown', (e) => {
		if (e.target.tagName === 'INPUT') return;
		const mod = e.metaKey || e.ctrlKey;
		if (mod && e.key === 'c' && selectedItem) {
			copyItem(selectedItem, 'copy');
			e.preventDefault();
		}
		if (mod && e.key === 'x' && selectedItem) {
			copyItem(selectedItem, 'cut');
			e.preventDefault();
		}
		if (mod && e.key === 'v' && clipboard) {
			pasteItem();
			e.preventDefault();
		}
		if (e.key === 'Delete' || e.key === 'Backspace') {
			if (
				selectedItem &&
				document.activeElement?.classList.contains('file-card')
			) {
				promptDelete(selectedItem);
				e.preventDefault();
			}
		}
	});

	// Click outside → deselect
	document.addEventListener('click', (e) => {
		if (!e.target.closest('.file-card') && !e.target.closest('#ctx-menu')) {
			grid?.querySelectorAll('.file-card').forEach((c) => {
				c.style.background = '';
				c.style.borderColor = '';
			});
			selectedItem = null;
		}
	});

	//  Navigate event (from breadcrumbs / sidebar / anywhere)
	// NOTE: Breadcrumbs and SidebarNav are defined in later scripts.
	// We just update currentPath and fire dir:load — scripts.js handles the rest.
	document.addEventListener('navigate', (e) => {
		const { path } = e.detail;
		currentPath = path;
		document.dispatchEvent(new CustomEvent('dir:load', { detail: { path } }));
	});

	//  Search events ─
	document.addEventListener('search:results', (e) => {
		renderSearchResults(e.detail.results, e.detail.q);
	});

	document.addEventListener('search:clear', () => {
		document.dispatchEvent(
			new CustomEvent('dir:load', { detail: { path: currentPath } }),
		);
	});

	document.addEventListener('search:start', () => {
		if (grid)
			grid.innerHTML = `
      <div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;
                  gap:12px;padding:60px;color:var(--ctp-overlay1);">
        <i class="ph ph-spinner" style="font-size:2rem;animation:spin 1s linear infinite;"></i>
        <span>Searching…</span>
      </div>`;
	});

	//  Toast ─
	function showToast(msg, type = 'ok') {
		const icons = {
			ok: 'ph-check-circle',
			info: 'ph-info',
			warn: 'ph-warning',
			err: 'ph-x-circle',
		};
		const colors = {
			ok: 'var(--ctp-green)',
			info: 'var(--ctp-blue)',
			warn: 'var(--ctp-yellow)',
			err: 'var(--ctp-red)',
		};
		const el = document.createElement('div');
		el.style.cssText = `
      position:fixed;bottom:48px;left:50%;transform:translateX(-50%);
      background:var(--ctp-surface0);border:1px solid var(--ctp-surface1);
      border-radius:8px;padding:9px 16px;font-size:0.75rem;
      color:var(--ctp-text);display:flex;align-items:center;gap:8px;
      box-shadow:0 4px 16px rgba(0,0,0,0.4);z-index:9999;
      animation:toastIn 0.2s ease;white-space:nowrap;`;
		el.innerHTML = `<i class="ph ${icons[type] || icons.ok}" style="color:${colors[type] || colors.ok};font-size:0.875rem;"></i>${msg}`;
		document.body.appendChild(el);
		setTimeout(() => el.remove(), 2800);
	}

	//  Inject animations ─
	const animStyle = document.createElement('style');
	animStyle.textContent = `
    @keyframes fadeUp  { from { opacity:0;transform:translateY(8px); } to { opacity:1;transform:translateY(0); } }
    @keyframes ctxIn   { from { opacity:0;transform:scale(0.95); }    to { opacity:1;transform:scale(1); } }
    @keyframes toastIn { from { opacity:0;transform:translateX(-50%) translateY(12px); } to { opacity:1;transform:translateX(-50%) translateY(0); } }
    @keyframes spin    { to   { transform:rotate(360deg); } }
  `;
	document.head.appendChild(animStyle);

	//  Utils ─
	function esc(s) {
		return String(s)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function escRe(s) {
		return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	return {
		render,
		renderSearchResults,
		showToast,
		get currentPath() {
			return currentPath;
		},
	};
})();
