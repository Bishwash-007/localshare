import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';
console.log('API Base URL:', API_BASE_URL);

const axiosInstance = axios.create({
	baseURL: API_BASE_URL,
});

export const fetchDirectoryContent = async (directory) => {
	try {
		const response = await axiosInstance.get(
			`/api/file?path=${encodeURIComponent(directory)}`,
		);
		console.log('Fetched directory content:', response.data);
		return response.data;
	} catch (error) {
		console.error('Error fetching directory content:', error);
		throw error;
	}
};
