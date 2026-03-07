/**
 * NVD API Service - Real CVE Data Integration
 * Fetches vulnerability data from NIST National Vulnerability Database
 */

const axios = require('axios');

// NVD API endpoints
const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/1.0';
const NVD_API_KEY = process.env.NVD_API_KEY || ''; // Optional API key for higher rate limits

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch CVEs from NVD API with pagination
 * @param {number} startIndex - Starting index (0-based)
 * @param {number} resultsPerPage - Results per page (max 100)
 */
const fetchCVEsFromNVD = async (startIndex = 0, resultsPerPage = 50) => {
  try {
    const params = {
      startIndex,
      resultsPerPage: Math.min(resultsPerPage, 100)
    };

    if (NVD_API_KEY) {
      params.apiKey = NVD_API_KEY;
    }

    console.log(`Fetching CVEs from NVD API (index: ${startIndex})...`);

    const response = await axios.get(NVD_API_BASE, { 
      params,
      timeout: 10000,
      headers: {
        'User-Agent': 'CVEarity/1.0'
      }
    });

    if (response.data && response.data.result && response.data.result.CVE_Items) {
      const cves = response.data.result.CVE_Items.map(item => ({
        cveId: item.cve.CVE_data_meta?.ID || 'UNKNOWN',
        title: item.cve.description?.description_data?.[0]?.value || 'No description',
        description: item.cve.description?.description_data?.[0]?.value || 'No description available',
        severity: parseSeverity(item),
        severityScore: parseScore(item),
        affectedSoftware: parseAffectedSoftware(item),
        publishedDate: item.publishedDate || new Date().toISOString(),
        lastModified: item.lastModifiedDate || new Date().toISOString(),
        referenceUrls: parseReferences(item)
      }));

      return cves; // Return just the array
    }

    return []; // Return empty array on no results
  } catch (error) {
    console.error('NVD API Error:', error.message);
    if (error.response?.status === 403) {
      console.log('⚠️  Rate limited or authentication failed. Add NVD_API_KEY to .env for higher limits');
    }
    return []; // Return empty array on error
  }
};

/**
 * Parse severity from NVD data
 */
const parseSeverity = (cveItem) => {
  try {
    const impact = cveItem.impact?.baseMetricV3 || cveItem.impact?.baseMetricV2;
    if (!impact) return 'unknown';

    const score = impact.cvssV3?.baseSeverity || impact.cvssV2?.severity;
    
    if (!score) return 'unknown';
    
    return score.toLowerCase();
  } catch (e) {
    return 'unknown';
  }
};

/**
 * Parse CVSS score
 */
const parseScore = (cveItem) => {
  try {
    const score = cveItem.impact?.baseMetricV3?.cvssV3?.baseScore ||
                  cveItem.impact?.baseMetricV2?.cvssV2?.baseScore ||
                  0;
    return parseFloat(score);
  } catch (e) {
    return 0;
  }
};

/**
 * Parse affected software/products
 */
const parseAffectedSoftware = (cveItem) => {
  try {
    const products = [];
    const configurations = cveItem.configurations?.nodes || [];
    
    configurations.forEach(node => {
      if (node.cpe_match) {
        node.cpe_match.forEach(match => {
          const cpe = match.cpe23Uri || match.cpe22Uri || '';
          if (cpe) {
            const parts = cpe.split(':');
            if (parts.length > 4) {
              const vendor = parts[3];
              const product = parts[4];
              if (vendor && product) {
                products.push(`${vendor}/${product}`);
              }
            }
          }
        });
      }
    });

    // Remove duplicates
    return [...new Set(products)];
  } catch (e) {
    return [];
  }
};

/**
 * Parse references
 */
const parseReferences = (cveItem) => {
  try {
    const refs = [];
    const referenceData = cveItem.cve?.references?.reference_data || [];
    
    referenceData.forEach(ref => {
      if (ref.url) {
        refs.push({
          url: ref.url,
          source: ref.source || 'External'
        });
      }
    });

    return refs;
  } catch (e) {
    return [];
  }
};

/**
 * Fetch recent CVEs (last 24 hours)
 */
const fetchRecentCVEs = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const params = {
      resultsPerPage: 100,
      startIndex: 0
    };

    if (NVD_API_KEY) {
      params.apiKey = NVD_API_KEY;
    }

    console.log('Fetching recent CVEs from NVD API...');

    const response = await axios.get(NVD_API_BASE, {
      params,
      timeout: 10000
    });

    if (response.data?.result?.CVE_Items) {
      const recentCVEs = response.data.result.CVE_Items
        .slice(0, 20)
        .map(item => ({
          cveId: item.cve.CVE_data_meta?.ID || 'UNKNOWN',
          title: item.cve.description?.description_data?.[0]?.value || 'No description',
          description: item.cve.description?.description_data?.[0]?.value || 'No description',
          severity: parseSeverity(item),
          severityScore: parseScore(item),
          affectedSoftware: parseAffectedSoftware(item),
          publishedDate: item.publishedDate,
          lastModified: item.lastModifiedDate || new Date().toISOString(),
          referenceUrls: parseReferences(item)
        }));

      return recentCVEs;
    }

    return [];
  } catch (error) {
    console.error('Recent CVE fetch error:', error.message);
    return [];
  }
};

/**
 * Search CVEs by keyword (requires API key for better results)
 */
const searchCVEsByKeyword = async (keyword) => {
  try {
    console.log(`Searching NVD for: ${keyword}`);

    const response = await axios.get(NVD_API_BASE, {
      params: {
        resultsPerPage: 50,
        startIndex: 0,
        keyword: keyword,
        ...(NVD_API_KEY && { apiKey: NVD_API_KEY })
      },
      timeout: 10000
    });

    if (response.data?.result?.CVE_Items) {
      const results = response.data.result.CVE_Items.map(item => ({
        cveId: item.cve.CVE_data_meta?.ID || 'UNKNOWN',
        title: item.cve.description?.description_data?.[0]?.value || 'No description',
        description: item.cve.description?.description_data?.[0]?.value || 'No description',
        severity: parseSeverity(item),
        severityScore: parseScore(item),
        affectedSoftware: parseAffectedSoftware(item),
        publishedDate: item.publishedDate,
        lastModified: item.lastModifiedDate || new Date().toISOString(),
        referenceUrls: parseReferences(item)
      }));

      return results;
    }

    return [];
  } catch (error) {
    console.error('CVE search error:', error.message);
    return [];
  }
};

module.exports = {
  fetchCVEsFromNVD,
  fetchRecentCVEs,
  searchCVEsByKeyword,
  delay
};
