import { XIcon } from '@phosphor-icons/react';

const Preview = ({ file, fileType }) => {
	switch (fileType) {
		case 'image':
			return (
				<img
					src={file}
					alt="Preview"
					className="max-w-full max-h-full object-contain rounded-md"
				/>
			);
		case 'text':
			return (
				<pre className="bg-surface0 p-4 rounded-lg overflow-auto max-h-full text-sm">
					{file}
				</pre>
			);
		case 'pdf':
			return (
				<embed
					src={file}
					type="application/pdf"
					width="100%"
					height="100%"
					className="rounded-md"
				/>
			);
		default:
			return (
				<p className="text-sm text-muted">
					Preview not available for this file type.
				</p>
			);
	}
};

const PreviewModal = ({
	file,
	fileType,
	fileName,
	onClose,
	isFolder = false,
}) => {
	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			onClick={onClose}
		>
			<div
				className="bg-mantle border border-surface1/40 rounded-2xl w-3/4 h-3/4 flex flex-col overflow-hidden shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center gap-2 px-4 py-3 bg-surface0/60 border-b border-surface1/40">
					<button
						onClick={onClose}
						className="w-3 h-3 rounded-full  flex items-center justify-center group"
					>
						<XIcon
							size={8}
							className="opacity-0 group-hover:opacity-100 transition"
						/>
					</button>
					<span className="flex-1 text-center text-xs text-muted">
						{fileName}
					</span>
				</div>
				<div className="flex flex-1 items-center justify-center overflow-hidden p-6">
					{isFolder ? (
						<p className="text-sm text-muted">Folder preview not available.</p>
					) : (
						<Preview file={file} fileType={fileType} />
					)}
				</div>
			</div>
		</div>
	);
};

export default PreviewModal;
