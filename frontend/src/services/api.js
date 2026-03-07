import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;

export const getCVEs = async (filters = {}) => {
  try {
    const response = await apiClient.get('/cves', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching CVEs:', error);
    throw error;
  }
};

export const getCVEById = async (id) => {
  try {
    const response = await apiClient.get(`/cves/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CVE:', error);
    throw error;
  }
};

export const getStatistics = async () => {
  try {
    const response = await apiClient.get('/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};
