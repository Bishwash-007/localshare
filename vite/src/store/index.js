import { create } from 'zustand';
import { fetchDirectoryContent } from '../api/index';

export const useStore = create((set) => ({
	currentDirectory: '/',
	directoryContent: [],
	isLoading: false,
	error: null,

	setCurrentDirectory: (directory) => set({ currentDirectory: directory }),
	setDirectoryContent: (content) => set({ directoryContent: content }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setError: (error) => set({ error }),

	loadDirectoryContent: async (directory) => {
		set({ isLoading: true, error: null });
		try {
			const { path, content } = await fetchDirectoryContent(directory);
			set({
				directoryContent: content,
				currentDirectory: path,
				isLoading: false,
			});
		} catch (error) {
			set({ error: error.message, isLoading: false });
		}
	},
}));

export default useStore;
