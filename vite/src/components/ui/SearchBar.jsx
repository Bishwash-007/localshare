import { MagnifyingGlassIcon } from '@phosphor-icons/react';

const SearchBar = ({ query, onSearch }) => {
	return (
		<div className="flex items-center gap-3 bg-surface0 px-4 py-2 rounded-xl w-full max-w-md border border-surface1">
			<MagnifyingGlassIcon size={18} />
			<input
				value={query}
				onChange={(e) => onSearch?.(e.target.value)}
				type="text"
				className="flex-1 bg-transparent focus:outline-none text-sm"
				placeholder="Search files and folders..."
			/>
			<kbd>⌘K</kbd>
		</div>
	);
};

export default SearchBar;
