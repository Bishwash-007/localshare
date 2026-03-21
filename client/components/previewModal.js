// Handles file preview modal open/close/content rendering

const PreviewModal = (() => {
	const modal = document.getElementById('preview-modal');
	const backdrop = document.getElementById('modal-backdrop');
	const closeBtn = document.getElementById('close-preview');
	const titleEl = modal?.querySelector('.modal__title');
	const bodyEl = document.getElementById('preview-content');

	//  Icon / type helpers
	const EXT_MAP = {
		// images
		jpg: 'image',
		jpeg: 'image',
		png: 'image',
		gif: 'image',
		webp: 'image',
		svg: 'image',
		bmp: 'image',
		// video
		mp4: 'video',
		mkv: 'video',
		mov: 'video',
		avi: 'video',
		webm: 'video',
		// audio
		mp3: 'audio',
		wav: 'audio',
		flac: 'audio',
		aac: 'audio',
		ogg: 'audio',
		// text / code
		txt: 'text',
		md: 'text',
		json: 'code',
		js: 'code',
		ts: 'code',
		py: 'code',
		sh: 'code',
		html: 'code',
		css: 'code',
		xml: 'code',
		// pdf
		pdf: 'pdf',
		// archive
		zip: 'archive',
		rar: 'archive',
		gz: 'archive',
		tar: 'archive',
	};

	function getType(filename) {
		const ext = filename.split('.').pop().toLowerCase();
		return EXT_MAP[ext] || 'unknown';
	}

	//  Renderers
	function renderImage(file) {
		return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
        <img
          src="/api/download?path=${encodeURIComponent(file.path)}"
          alt="${file.name}"
          style="max-width:100%;max-height:60vh;border-radius:8px;border:1px solid var(--ctp-surface1);"
          onerror="this.src='https://placehold.co/400x300/313244/cdd6f4?text=Preview+unavailable'"
        />
        ${renderFileMeta(file)}
      </div>`;
	}

	function renderVideo(file) {
		return `
      <div style="display:flex;flex-direction:column;gap:16px;">
        <video
          controls
          style="width:100%;max-height:60vh;border-radius:8px;background:#000;"
          src="/api/download?path=${encodeURIComponent(file.path)}">
          Your browser does not support video playback.
        </video>
        ${renderFileMeta(file)}
      </div>`;
	}

	function renderAudio(file) {
		return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:24px;padding:24px 0;">
        <i class="ph ph-music-note" style="font-size:5rem;color:var(--ctp-green);"></i>
        <audio controls style="width:100%;"
          src="/api/download?path=${encodeURIComponent(file.path)}">
          Your browser does not support audio playback.
        </audio>
        ${renderFileMeta(file)}
      </div>`;
	}

	function renderText(file) {
		// content should be passed in via file.previewContent if pre-fetched
		const content = file.previewContent
			? `<pre style="margin:0;white-space:pre-wrap;word-break:break-word;font-size:0.8rem;">${escHtml(file.previewContent)}</pre>`
			: `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:32px;color:var(--ctp-overlay1);">
           <i class="ph ph-spinner" style="font-size:2rem;animation:spin 1s linear infinite;"></i>
           <span>Loading preview…</span>
         </div>`;
		return `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="background:var(--ctp-mantle);border:1px solid var(--ctp-surface0);border-radius:8px;padding:16px;overflow:auto;max-height:55vh;">
          ${content}
        </div>
        ${renderFileMeta(file)}
      </div>`;
	}

	function renderPDF(file) {
		return `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <iframe
          src="/api/download?path=${encodeURIComponent(file.path)}"
          style="width:100%;height:60vh;border:none;border-radius:8px;background:var(--ctp-mantle);"
          title="${file.name}">
        </iframe>
        ${renderFileMeta(file)}
      </div>`;
	}

	function renderFallback(file) {
		const iconMap = {
			archive: 'ph-file-zip',
			video: 'ph-film-strip',
			unknown: 'ph-file',
		};
		const icon = iconMap[getType(file.name)] || 'ph-file';
		return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding:40px 20px;">
        <i class="${icon}" style="font-size:5rem;color:var(--ctp-overlay1);"></i>
        <p style="color:var(--ctp-subtext0);text-align:center;">
          Preview is not available for this file type.
        </p>
        <a
          href="/api/download?path=${encodeURIComponent(file.path)}"
          download="${file.name}"
          style="display:inline-flex;align-items:center;gap:8px;padding:8px 20px;
                 background:var(--ctp-blue);color:var(--ctp-base);
                 border-radius:8px;font-weight:600;font-size:0.875rem;text-decoration:none;">
          <i class="ph ph-download-simple"></i> Download
        </a>
        ${renderFileMeta(file)}
      </div>`;
	}

	function renderFileMeta(file) {
		return `
      <div style="display:flex;gap:24px;padding:12px 0;border-top:1px solid var(--ctp-surface0);flex-wrap:wrap;">
        <span style="font-size:0.75rem;color:var(--ctp-overlay1);">
          <i class="ph ph-file"></i> ${file.name}
        </span>
        ${file.size_fmt ? `<span style="font-size:0.75rem;color:var(--ctp-overlay1);"><i class="ph ph-database"></i> ${file.size_fmt}</span>` : ''}
        ${file.modified ? `<span style="font-size:0.75rem;color:var(--ctp-overlay1);"><i class="ph ph-clock"></i> ${file.modified}</span>` : ''}
        <a href="/api/download?path=${encodeURIComponent(file.path)}" download="${file.name}"
           style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--ctp-blue);">
          <i class="ph ph-download-simple"></i> Download
        </a>
      </div>`;
	}

	//  Public API
	function open(file) {
		if (!modal || !bodyEl) return;
		if (titleEl) titleEl.textContent = file.name;

		const type = getType(file.name);
		let html = '';

		switch (type) {
			case 'image':
				html = renderImage(file);
				break;
			case 'video':
				html = renderVideo(file);
				break;
			case 'audio':
				html = renderAudio(file);
				break;
			case 'text':
			case 'code':
				html = renderText(file);
				break;
			case 'pdf':
				html = renderPDF(file);
				break;
			default:
				html = renderFallback(file);
				break;
		}

		bodyEl.innerHTML = html;
		modal.classList.remove('modal--hidden');
		document.body.style.overflow = 'hidden';

		// For text/code files, fetch content if not pre-loaded
		if ((type === 'text' || type === 'code') && !file.previewContent) {
			fetch(`/api/download?path=${encodeURIComponent(file.path)}`)
				.then((r) => r.text())
				.then((content) => {
					const pre = bodyEl.querySelector('pre');
					if (pre) pre.innerHTML = escHtml(content.slice(0, 20000));
					if (content.length > 20000) {
						const note = document.createElement('p');
						note.style.cssText =
							'font-size:0.75rem;color:var(--ctp-overlay1);margin-top:8px;';
						note.textContent = 'Preview truncated to first 20,000 characters.';
						bodyEl.querySelector('div > div')?.appendChild(note);
					}
				})
				.catch(() => {
					const spinner = bodyEl.querySelector('[style*=spinner]');
					if (spinner)
						spinner.innerHTML =
							'<span style="color:var(--ctp-red)">Failed to load preview.</span>';
				});
		}
	}

	function close() {
		if (!modal) return;
		modal.classList.add('modal--hidden');
		document.body.style.overflow = '';
		if (bodyEl) bodyEl.innerHTML = '';
		// Stop any media playing
		bodyEl?.querySelectorAll('video, audio').forEach((el) => el.pause());
	}

	//  Events
	closeBtn?.addEventListener('click', close);
	backdrop?.addEventListener('click', close);
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && !modal?.classList.contains('modal--hidden'))
			close();
	});

	//  Utils
	function escHtml(str) {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
	}

	// spin keyframe (injected once)
	const styleEl = document.createElement('style');
	styleEl.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
	document.head.appendChild(styleEl);

	return { open, close, getType };
})();
