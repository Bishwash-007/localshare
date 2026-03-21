// Fuzzy search — queries /api/search and renders results

const SearchBar = (() => {
	const input = document.querySelector('.search-bar__input');
	let debounceTimer = null;
	let isSearching = false;

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
			const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
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

	return { focus: () => input?.focus() };
})();
