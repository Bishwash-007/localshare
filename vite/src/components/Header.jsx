import { ShareNetworkIcon } from '@phosphor-icons/react';
import SearchBar from './ui/SearchBar';
import { useEffect, useState } from 'react';

const Header = () => {
	const [query, setQuery] = useState('');
	useEffect(() => {
		const timeout = setTimeout(() => {}, 300);

		return () => clearTimeout(timeout);
	}, [query]);

	return (
		<header className="flex flex-row items-center justify-between py-4 gap-3">
			<div className="flex items-center gap-2">
				<span className="text-lg">Local Share</span>
				<ShareNetworkIcon size={22} />
			</div>
			<SearchBar query={query} onSearch={setQuery} />
		</header>
	);
};

export default Header;
