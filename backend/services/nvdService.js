/**
 * NVD API Service - Real CVE Data Integration
 * Fetches vulnerability data from NIST National Vulnerability Database
 * Uses NVD API v2.0 (v1.0 was retired December 2023)
 */

const axios = require('axios');

const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/2.0';
const NVD_API_KEY = process.env.NVD_API_KEY || '';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In v2.0 the API key goes in the request header, not a query param
const buildHeaders = () => {
  const headers = { 'User-Agent': 'CVEarity/1.0' };
  if (NVD_API_KEY) headers['apiKey'] = NVD_API_KEY;
  return headers;
};

/**
 * Parse severity from NVD v2.0 metrics
 */
const parseSeverity = (cve) => {
  try {
    const v31 = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity;
    const v30 = cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseSeverity;
    const v2  = cve.metrics?.cvssMetricV2?.[0]?.baseSeverity;
    const score = v31 || v30 || v2;
    return score ? score.toLowerCase() : 'unknown';
  } catch (e) {
    return 'unknown';
  }
};

/**
 * Parse CVSS base score from NVD v2.0 metrics
 */
const parseScore = (cve) => {
  try {
    const v31 = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore;
    const v30 = cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore;
    const v2  = cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore;
    return parseFloat(v31 ?? v30 ?? v2 ?? 0);
  } catch (e) {
    return 0;
  }
};

/**
 * Parse affected software from NVD v2.0 configurations
 */
const parseAffectedSoftware = (cve) => {
  try {
    const products = [];
    const configs = cve.configurations || [];

    configs.forEach(config => {
      (config.nodes || []).forEach(node => {
        (node.cpeMatch || []).forEach(match => {
          const cpe = match.criteria || '';
          // CPE 2.3 format: cpe:2.3:a:<vendor>:<product>:...
          const parts = cpe.split(':');
          if (parts.length > 4) {
            const vendor = parts[3];
            const product = parts[4];
            if (vendor && product && vendor !== '*') {
              products.push(`${vendor}/${product}`);
            }
          }
        });
      });
    });

    return [...new Set(products)];
  } catch (e) {
    return [];
  }
};

/**
 * Parse references from NVD v2.0
 */
const parseReferences = (cve) => {
  try {
    return (cve.references || []).map(ref => ({
      url: ref.url,
      source: ref.source || 'External'
    }));
  } catch (e) {
    return [];
  }
};

/**
 * Map a NVD v2.0 vulnerability object to our internal format
 */
const mapVulnerability = (vuln) => {
  const cve = vuln.cve;
  const enDesc = (cve.descriptions || []).find(d => d.lang === 'en');
  const description = enDesc?.value || 'No description available';

  return {
    cveId: cve.id,
    title: description.length > 120 ? description.substring(0, 117) + '...' : description,
    description,
    severity: parseSeverity(cve),
    severityScore: parseScore(cve),
    affectedSoftware: parseAffectedSoftware(cve),
    publishedDate: cve.published || new Date().toISOString(),
    lastModified: cve.lastModified || new Date().toISOString(),
    referenceUrls: parseReferences(cve)
  };
};

/**
 * Fetch CVEs from NVD API v2.0 with pagination
 */
const fetchCVEsFromNVD = async (startIndex = 0, resultsPerPage = 50) => {
  try {
    console.log(`Fetching CVEs from NVD API v2.0 (index: ${startIndex})...`);

    const response = await axios.get(NVD_API_BASE, {
      params: {
        startIndex,
        resultsPerPage: Math.min(resultsPerPage, 2000)
      },
      headers: buildHeaders(),
      timeout: 15000
    });

    if (response.data?.vulnerabilities) {
      return response.data.vulnerabilities.map(mapVulnerability);
    }

    return [];
  } catch (error) {
    console.error('NVD API v2.0 Error:', error.message);
    if (error.response?.status === 403) {
      console.log('⚠️  Rate limited or authentication failed. Add NVD_API_KEY to .env for higher limits');
    }
    return [];
  }
};

/**
 * Fetch recent CVEs (last 24 hours)
 */
const fetchRecentCVEs = async () => {
  try {
    // NVD v2.0 date format: 2023-01-01T00:00:00.000
    const pubStartDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .replace('Z', '');

    console.log('Fetching recent CVEs from NVD API v2.0...');

    const response = await axios.get(NVD_API_BASE, {
      params: { resultsPerPage: 100, startIndex: 0, pubStartDate },
      headers: buildHeaders(),
      timeout: 15000
    });

    if (response.data?.vulnerabilities) {
      return response.data.vulnerabilities.slice(0, 20).map(mapVulnerability);
    }

    return [];
  } catch (error) {
    console.error('Recent CVE fetch error:', error.message);
    return [];
  }
};

/**
 * Search CVEs by keyword
 */
const searchCVEsByKeyword = async (keyword) => {
  try {
    console.log(`Searching NVD for: ${keyword}`);

    const response = await axios.get(NVD_API_BASE, {
      params: {
        resultsPerPage: 50,
        startIndex: 0,
        keywordSearch: keyword   // v2.0 uses keywordSearch (not keyword)
      },
      headers: buildHeaders(),
      timeout: 15000
    });

    if (response.data?.vulnerabilities) {
      return response.data.vulnerabilities.map(mapVulnerability);
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
