import {
	ClockIcon,
	FileIcon,
	ShareNetworkIcon,
	WifiHighIcon,
	WifiSlashIcon,
} from '@phosphor-icons/react';
import Explorer from './components/Explorer';
import Content from './components/Content';
import Header from './components/Header';
import useStore from './store';

function App() {
	return (
		<main className="h-screen w-screen bg-crust px-16 flex flex-col">
			<div className="sticky top-0 z-20">
				<Header />
			</div>
			<div className="flex flex-1 flex-row gap-6 min-h-0">
				<div className="sticky top-16 h-[calc(100vh-64px-48px)] z-10">
					<Explorer />
				</div>
				<div className="flex-1 min-h-0 mb-4">
					<Content />
				</div>
			</div>
			<div className="sticky bottom-0 z-20">
				<Footer />
			</div>
		</main>
	);
}

export default App;

const Footer = () => {
	const { directoryContent = [], isLoading } = useStore();
	return (
		<footer className="border-t border-surface1 bg-crust">
			<div className="flex flex-row gap-6 w-full items-center justify-end py-2 px-4">
				<span className="text-sm flex-row gap-1 flex items-center self-start">
					<FileIcon size={16} />
					{isLoading ? '...' : `${directoryContent.length} items`}
				</span>
				{/* divider */}
				<span className="text-sm flex-row gap-1 flex items-center"></span>
				<span id="" className="text-sm flex-row gap-1 flex items-center ">
					{isLoading ? <WifiHighIcon size={16} /> : <WifiSlashIcon size={16} />}
					Connected
				</span>
				<span className="text-sm flex-row gap-1 flex items-center "></span>
				<span className="text-sm flex-row gap-1 flex items-center ">
					<ClockIcon size={16} />
					Last synced: just now
				</span>
			</div>
		</footer>
	);
};
