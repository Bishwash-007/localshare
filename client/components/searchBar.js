// Fuzzy search — queries /api/search and renders results

const SearchBar = (() => {
	const input = document.querySelector('.search-bar__input');
	let debounceTimer = null;
	let isSearching = false;
	let currentDir = '';

	// Listen for directory changes to update currentDir
	document.addEventListener('navigate', (e) => {
		currentDir = e.detail.path || '';
	});

	//  Debounced search
	function handleInput(e) {
		const q = e.target.value.trim();
		clearTimeout(debounceTimer);

		if (!q) {
			// Restore the current directory listing
			document.dispatchEvent(new CustomEvent('search:clear'));
			return;
		}

		debounceTimer = setTimeout(() => doSearch(q), 250);
	}

	async function doSearch(q) {
		if (isSearching) return;
		isSearching = true;
		document.dispatchEvent(new CustomEvent('search:start', { detail: { q } }));

		try {
			const res = await fetch(
				`/api/files/search?dir=${encodeURIComponent(currentDir)}&q=${encodeURIComponent(q)}`,
			);
			const data = await res.json();
			document.dispatchEvent(
				new CustomEvent('search:results', {
					detail: { q, results: data.results || [] },
				}),
			);
		} catch {
			document.dispatchEvent(
				new CustomEvent('search:error', { detail: { q } }),
			);
		} finally {
			isSearching = false;
		}
	}

	//  Keyboard shortcut ⌘K / Ctrl+K
	document.addEventListener('keydown', (e) => {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			input?.focus();
			input?.select();
		}
		if (e.key === 'Escape' && document.activeElement === input) {
			input.value = '';
			input.blur();
			document.dispatchEvent(new CustomEvent('search:clear'));
		}
	});

	//  Bind
	input?.addEventListener('input', handleInput);

	// Listen for search:results and render them
	document.addEventListener('search:results', (e) => {
		FileList.renderSearchResults(e.detail.results, e.detail.q);
	});

	// Listen for search:clear to reload directory
	document.addEventListener('search:clear', () => {
		document.dispatchEvent(
			new CustomEvent('dir:load', { detail: { path: currentDir } }),
		);
	});

	return { focus: () => input?.focus() };
})();
