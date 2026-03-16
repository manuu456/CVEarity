/**
 * Axios API client for the CVEarity backend.
 *
 * Provides a pre-configured Axios instance and convenience wrappers for the
 * most common API calls (CVE listing, detail, and statistics).
 *
 * @module services/api
 */

import axios from 'axios';

/** Base URL for all API requests; falls back to a relative `/api` path. */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/** Pre-configured Axios instance pointing at the CVEarity API. */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default apiClient;

/**
 * Fetch a list of CVEs, optionally filtered.
 *
 * @param {Object} [filters] - Query-string filters forwarded to the API.
 * @param {string} [filters.severity] - Filter by severity level.
 * @param {string} [filters.software] - Filter by affected software name.
 * @param {string} [filters.year] - Filter by publication year.
 * @param {string} [filters.search] - Free-text search term.
 * @returns {Promise<Object>} API response data.
 */
export const getCVEs = async (filters = {}) => {
  try {
    const response = await apiClient.get('/cves', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching CVEs:', error);
    throw error;
  }
};

/**
 * Fetch a single CVE by its identifier.
 *
 * @param {string} id - The CVE ID (e.g. `"CVE-2024-1234"`).
 * @returns {Promise<Object>} API response data.
 */
export const getCVEById = async (id) => {
  try {
    const response = await apiClient.get(`/cves/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching CVE:', error);
    throw error;
  }
};

/**
 * Fetch aggregate dashboard statistics (totals by severity, year, etc.).
 *
 * @returns {Promise<Object>} API response data.
 */
export const getStatistics = async () => {
  try {
    const response = await apiClient.get('/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};
