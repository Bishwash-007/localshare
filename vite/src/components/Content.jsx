import BreadCrumbs from './ui/BreadCrumbs';
import FolderItem from './ui/FolderItem';
import FileItem from './ui/FileItem';
import { useEffect } from 'react';
import useStore from '../store/index';

const Content = () => {
	const {
		directoryContent = [],
		// isLoading,
		// error,
		currentDirectory,
		loadDirectoryContent,
	} = useStore();

	useEffect(() => {
		loadDirectoryContent('');
	}, []);

	const handleFolderDoubleClick = (folderName) => {
		const newPath = currentDirectory
			? `${currentDirectory}/${folderName}`
			: folderName;
		loadDirectoryContent(newPath);
	};

	const crumbs = ['Home', ...currentDirectory.split('/').filter(Boolean)];

	const handleCrumbClick = (crumb, index) => {
		if (index === 0) {
			loadDirectoryContent('');
			return;
		}
		const newPath = crumbs.slice(1, index + 1).join('/');
		loadDirectoryContent(newPath);
	};

	return (
		<section className="bg-mantle rounded-lg px-6 py-8 flex flex-col gap-4 w-full h-full">
			<BreadCrumbs crumbs={crumbs} onCrumbClick={handleCrumbClick} />
			<div className="flex flex-row flex-wrap gap-12 items-start justify-start">
				{directoryContent.map((item) => {
					if (item.isFolder)
						return (
							<FolderItem
								key={item.name}
								{...item}
								onDoubleClick={() => handleFolderDoubleClick(item.name)}
							/>
						);
					return (
						<FileItem
							key={item.name}
							{...item}
							onClick={() => console.log('clicked', item.name)}
							onDoubleClick={() => console.log('open', item.originalUrl)}
						/>
					);
				})}
			</div>
		</section>
	);
};

export default Content;
