const axios = require('axios');
const { statements } = require('../database/init');

const NVD_API_BASE = 'https://services.nvd.nist.gov/rest/json/cves/1.0';

// Fetch CVEs from NVD API
const fetchCVEsFromNVD = async (options = {}) => {
  try {
    const params = {
      startIndex: options.startIndex || 0,
      resultsPerPage: options.resultsPerPage || 20,
      ...options.searchCriteria
    };

    const response = await axios.get(NVD_API_BASE, {
      params,
      timeout: 10000
    });

    return response.data.result?.CVE_Items || [];
  } catch (error) {
    console.error('Error fetching from NVD API:', error.message);
    return [];
  }
};

// Fetch recent CVEs from NVD API
const fetchRecentCVEs = async (days = 7) => {
  try {
    // For recent CVEs, we'll use a modified approach since NVD API has rate limits
    // This is a simplified version - in production you might want to cache this
    const response = await axios.get('https://services.nvd.nist.gov/rest/json/cves/2.0', {
      params: {
        startIndex: 0,
        resultsPerPage: 50,
        sortBy: 'published_date',
        orderBy: 'descending'
      },
      timeout: 10000,
      headers: {
        'Api-Key': process.env.NVD_API_KEY || ''
      }
    });

    return response.data.vulnerabilities || [];
  } catch (error) {
    console.error('Error fetching recent CVEs from NVD:', error.message);
    return [];
  }
};

// Save CVE to local database
const saveCVEToDB = (cveData) => {
  try {
    const cveId = cveData.cve?.id || 'UNKNOWN';
    const title = cveData.cve?.descriptions?.[0]?.value || 'No description available';
    const description = title;
    
    // Calculate severity
    let severity = 'unknown';
    let severityScore = 0;
    
    if (cveData.impact?.baseMetricV3?.cvssV3?.baseSeverity) {
      severity = cveData.impact.baseMetricV3.cvssV3.baseSeverity.toLowerCase();
      severityScore = cveData.impact.baseMetricV3.cvssV3.baseScore;
    } else if (cveData.impact?.baseMetricV2?.baseSeverity) {
      severity = cveData.impact.baseMetricV2.baseSeverity.toLowerCase();
      severityScore = cveData.impact.baseMetricV2.cvssV2.baseScore;
    }

    const affectedSoftware = cveData.cve?.affects?.vendor?.[0]?.product?.map(p => p.productName) || [];
    const publishedDate = cveData.cve?.published?.split('T')[0] || new Date().toISOString().split('T')[0];
    const lastModified = cveData.cve?.lastModified?.split('T')[0] || publishedDate;
    
    const references = cveData.cve?.references?.map(ref => ref.url) || [];

    // Check if CVE already exists
    const existingCVE = statements.getCVEById.get(cveId);
    if (!existingCVE) {
      statements.insertCVE.run(
        cveId,
        title,
        description,
        severity,
        severityScore,
        JSON.stringify(affectedSoftware),
        publishedDate,
        lastModified,
        JSON.stringify(references)
      );
    }

    return cveId;
  } catch (error) {
    console.error('Error saving CVE to DB:', error.message);
    return null;
  }
};

// Search CVEs in NVD and save to local DB
const searchAndSaveCVEs = async (searchTerm, limit = 50) => {
  try {
    const nvdCVEs = await fetchCVEsFromNVD({
      startIndex: 0,
      resultsPerPage: limit,
      searchCriteria: { keyword: searchTerm }
    });

    const savedCVEIds = [];
    for (const cveItem of nvdCVEs) {
      const cveId = saveCVEToDB(cveItem.cve);
      if (cveId) {
        savedCVEIds.push(cveId);
      }
    }

    return savedCVEIds;
  } catch (error) {
    console.error('Error searching and saving CVEs:', error.message);
    return [];
  }
};

// Get CVE statistics
const getCVEStats = () => {
  try {
    const totalResult = statements.getCVEsCount.get();
    const severityResult = statements.getCVEsBySeverityCount.all();
    const yearResult = statements.getCVEsByYearCount.all();

    const bySeverity = {};
    (severityResult || []).forEach(row => {
      bySeverity[row.severity] = row.count;
    });

    const byYear = {};
    (yearResult || []).forEach(row => {
      byYear[row.year] = row.count;
    });

    return {
      totalCVEs: totalResult?.count || 0,
      bySeverity,
      byYear
    };
  } catch (error) {
    console.error('Error getting CVE stats:', error.message);
    return { totalCVEs: 0, bySeverity: {}, byYear: {} };
  }
};

module.exports = {
  fetchCVEsFromNVD,
  fetchRecentCVEs,
  saveCVEToDB,
  searchAndSaveCVEs,
  getCVEStats
};
