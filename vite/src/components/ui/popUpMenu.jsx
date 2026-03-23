const folderOptions = [
	{ label: 'Open', action: 'open' },
	{ label: 'Open in New Tab', action: 'open-new-tab' },
	{ label: 'Copy', action: 'copy' },
	{ label: 'Move', action: 'move' },
	{ label: 'Rename', action: 'rename' },
	{ label: 'Compress', action: 'compress' },
	{ label: 'Get Info', action: 'properties' },
	{ label: 'Delete', action: 'delete', destructive: true },
];

const fileOptions = [
	{ label: 'Open', action: 'open' },
	{ label: 'Open With', action: 'open-with' },
	{ label: 'Quick Look', action: 'quick-look' },
	{ label: 'Copy', action: 'copy' },
	{ label: 'Move', action: 'move' },
	{ label: 'Rename', action: 'rename' },
	{ label: 'Compress', action: 'compress' },
	{ label: 'Share', action: 'share' },
	{ label: 'Get Info', action: 'properties' },
	{ label: 'Delete', action: 'delete', destructive: true },
];

const dividerBefore = ['compress', 'share', 'properties', 'delete'];

const PopUpMenu = ({ position, onAction, onClose, isFolder = false }) => {
	const options = isFolder ? folderOptions : fileOptions;
	return (
		<div className="fixed inset-0 z-50" onClick={onClose}>
			<div
				className="absolute bg-mantle rounded-md shadow-xl p-1 min-w-44 border border-surface2/40 z-50"
				style={{ top: position?.y, left: position?.x }}
				onClick={(e) => e.stopPropagation()}
			>
				{options.map((option) => (
					<div key={option.label}>
						{dividerBefore.includes(option.action) && (
							<div className="border-t border-surface2/40 my-1" />
						)}
						<div
							className={`px-3 py-1.5 rounded-md text-sm cursor-pointer ${option.destructive ? 'text-red-400 hover:bg-red-500/20' : 'hover:bg-surface2'}`}
							onClick={() => {
								onAction?.(option.action);
								onClose?.();
							}}
						>
							{option.label}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default PopUpMenu;
