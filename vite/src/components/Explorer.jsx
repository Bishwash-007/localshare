import {
	HardDrivesIcon,
	HouseIcon,
	ImageIcon,
	FileIcon,
	MusicNoteIcon,
	VideoIcon,
} from '@phosphor-icons/react';
import useStore from '../store';

const SHORTCUTS = [
	{ name: 'Home', path: '' },
	{ name: 'Photos', path: 'photos' },
	{ name: 'Documents', path: 'documents' },
	{ name: 'Videos', path: 'videos' },
];

const Explorer = () => {
	const { loadDirectoryContent, currentDirectory } = useStore();

	return (
		<section className="flex gap-6">
			<aside className="flex flex-col justify-between gap-6 w-48">
				{/* Explorer */}
				<div className="flex flex-col gap-2">
					<span className="text-md font-semibold">Explorer</span>
					<div className="border-b border-surface1" />
					<ul className="flex flex-col gap-1 w-full">
						{SHORTCUTS.map((item) => (
							<li
								key={item.name}
								onClick={() => loadDirectoryContent(item.path)}
								className={`rounded-md px-2 py-2 hover:bg-white/10 active:bg-white/20 cursor-pointer
                  ${currentDirectory === item.path ? 'bg-white/10' : ''}`}
							>
								<a className="text-sm whitespace-nowrap flex items-center gap-2">
									{item.name}
								</a>
							</li>
						))}
					</ul>
				</div>

				{/* Storage - unchanged */}
				<div className="flex flex-col gap-2">
					<span className="text-sm font-semibold whitespace-nowrap">
						Storage
					</span>
					<div className="border-b border-surface1" />
					<ul className="flex flex-col gap-1 w-full">
						{['Internal Storage', 'External Card'].map((label) => (
							<li
								key={label}
								className="rounded-md px-2 py-2 hover:bg-white/10 active:bg-white/20"
							>
								<a href="#" className="text-sm font-medium whitespace-nowrap">
									{label}
								</a>
							</li>
						))}
					</ul>
					<div className="flex flex-col gap-1 px-2 pt-1">
						<div className="flex items-center gap-2">
							<HardDrivesIcon size={16} />
							<div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden">
								<div className="bg-red w-1/2 h-full" />
							</div>
						</div>
						<span className="text-xs whitespace-nowrap">
							124.00 GB / 256.00 GB
						</span>
						<span className="text-xs whitespace-nowrap text-text-muted">
							128 GB available
						</span>
					</div>
				</div>
			</aside>
		</section>
	);
};

export default Explorer;
