import { API_BASE_URL } from '../../api';
import { FileTypeIcon } from '../../constant/index';

const FileItem = ({
	name,
	type, // mimetype
	// size,
	previewUrl,
	// originalUrl,
	// width,
	// height,
	// lastModified,
	onSecondaryClick,
	onClick,
	onDoubleClick,
	onDragEvent,
	onDragEnd,
	onSpacePress,
	onKeyBoardEvent,
}) => {
	const handleKeyDown = (e) => {
		if (e.key === ' ') onSpacePress?.(e);
		onKeyBoardEvent?.(e);
	};


	const extension = name.split('.').pop();
	const nameWithoutExt = name.split('.').slice(0, -1).join('.');

	const thumbnailSrc = previewUrl
		? `${API_BASE_URL}/${previewUrl}`
		: FileTypeIcon[type] || FileTypeIcon['default'];

	return (
		<div
			className="flex flex-col gap-2 items-center justify-start rounded-md p-2 hover:scale-105 active:bg-white/10 focus:bg-white/10 transition duration-300 w-[90px] h-[110px]"
			onClick={onClick}
			onDoubleClick={onDoubleClick}
			onContextMenu={onSecondaryClick}
			onDragStart={onDragEvent}
			onDragEnd={onDragEnd}
			onKeyDown={handleKeyDown}
			tabIndex={0}
			draggable
		>
			<img
				src={thumbnailSrc}
				alt={name}
				height={56}
				width={56}
				className="inline-block object-cover rounded"
			/>
			<span className="flex flex-row items-center justify-start w-full">
				<p className="w-16 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted text-start">
					{nameWithoutExt}
				</p>
				<p className="text-ellipsis whitespace-nowrap text-sm text-muted text-center">
					.{extension}
				</p>
			</span>
		</div>
	);
};

export default FileItem;
