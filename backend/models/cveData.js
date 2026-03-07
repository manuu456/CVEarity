// Mock CVE Database
const cveDatabase = [
  {
    id: "CVE-2024-1086",
    cveId: "CVE-2024-1086",
    title: "Linux Kernel Privilege Escalation",
    description: "A use-after-free vulnerability in the Linux kernel networking subsystem could allow a local attacker to elevate privileges.",
    severity: "critical",
    severityScore: 9.8,
    affectedSoftware: ["Linux Kernel 5.x", "Linux Kernel 6.x"],
    publishedDate: "2024-01-15",
    updatedDate: "2024-01-20",
    cvssScore: 9.8,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    cweId: "CWE-416",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-1086"]
  },
  {
    id: "CVE-2024-2342",
    cveId: "CVE-2024-2342",
    title: "Apache OpenOffice XML External Entity Injection",
    description: "XML External Entity (XXE) vulnerability in Apache OpenOffice allows remote code execution through a malicious document.",
    severity: "critical",
    severityScore: 9.6,
    affectedSoftware: ["Apache OpenOffice 4.1.x", "Apache OpenOffice 4.2.x"],
    publishedDate: "2024-02-08",
    updatedDate: "2024-02-15",
    cvssScore: 9.6,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
    cweId: "CWE-611",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-2342"]
  },
  {
    id: "CVE-2024-3121",
    cveId: "CVE-2024-3121",
    title: "OpenSSH Authentication Bypass",
    description: "Authentication bypass vulnerability in OpenSSH allows unauthorized access through crafted authentication requests.",
    severity: "critical",
    severityScore: 9.1,
    affectedSoftware: ["OpenSSH 8.0p1", "OpenSSH 9.0p1"],
    publishedDate: "2024-01-25",
    updatedDate: "2024-02-01",
    cvssScore: 9.1,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N",
    cweId: "CWE-287",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-3121"]
  },
  {
    id: "CVE-2024-4567",
    cveId: "CVE-2024-4567",
    title: "PHP PHAR Protocol Stream Wrapper RCE",
    description: "Remote code execution vulnerability in PHP PHAR protocol allows execution through serialized object injection.",
    severity: "high",
    severityScore: 8.8,
    affectedSoftware: ["PHP 8.0.x", "PHP 8.1.x", "PHP 8.2.x"],
    publishedDate: "2024-02-20",
    updatedDate: "2024-02-28",
    cvssScore: 8.8,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
    cweId: "CWE-502",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-4567"]
  },
  {
    id: "CVE-2024-5678",
    cveId: "CVE-2024-5678",
    title: "Node.js HTTP/2 Rapid Reset Attack",
    description: "DoS vulnerability in Node.js HTTP/2 implementation allows attackers to cause denial of service.",
    severity: "high",
    severityScore: 7.5,
    affectedSoftware: ["Node.js 18.x", "Node.js 20.x"],
    publishedDate: "2024-01-10",
    updatedDate: "2024-01-18",
    cvssScore: 7.5,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
    cweId: "CWE-400",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-5678"]
  },
  {
    id: "CVE-2024-6789",
    cveId: "CVE-2024-6789",
    title: "Django Arbitrary File Upload",
    description: "File upload vulnerability in Django allows arbitrary file upload leading to RCE.",
    severity: "high",
    severityScore: 8.6,
    affectedSoftware: ["Django 3.2.x", "Django 4.0.x", "Django 4.1.x"],
    publishedDate: "2024-02-12",
    updatedDate: "2024-02-19",
    cvssScore: 8.6,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H",
    cweId: "CWE-434",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-6789"]
  },
  {
    id: "CVE-2024-7890",
    cveId: "CVE-2024-7890",
    title: "PostgreSQL Privilege Escalation",
    description: "Privilege escalation vulnerability in PostgreSQL allows local users to gain elevated privileges.",
    severity: "high",
    severityScore: 8.4,
    affectedSoftware: ["PostgreSQL 12.x", "PostgreSQL 13.x", "PostgreSQL 14.x"],
    publishedDate: "2024-01-30",
    updatedDate: "2024-02-05",
    cvssScore: 8.4,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
    cweId: "CWE-269",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-7890"]
  },
  {
    id: "CVE-2024-8901",
    cveId: "CVE-2024-8901",
    title: "React DOM XSS Vulnerability",
    description: "Cross-site scripting vulnerability in React DOM allows DOM-based XSS through specific component patterns.",
    severity: "medium",
    severityScore: 6.1,
    affectedSoftware: ["React 17.x", "React 18.x"],
    publishedDate: "2024-02-03",
    updatedDate: "2024-02-10",
    cvssScore: 6.1,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N",
    cweId: "CWE-79",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-8901"]
  },
  {
    id: "CVE-2024-9012",
    cveId: "CVE-2024-9012",
    title: "Kubernetes API Server RBAC Bypass",
    description: "RBAC (Role-Based Access Control) bypass in Kubernetes API server allows unauthorized actions.",
    severity: "high",
    severityScore: 8.2,
    affectedSoftware: ["Kubernetes 1.24.x", "Kubernetes 1.25.x", "Kubernetes 1.26.x"],
    publishedDate: "2024-01-22",
    updatedDate: "2024-01-29",
    cvssScore: 8.2,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
    cweId: "CWE-639",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-9012"]
  },
  {
    id: "CVE-2024-0123",
    cveId: "CVE-2024-0123",
    title: "TLS Certificate Validation Bypass",
    description: "Certificate validation bypass in TLS implementations allows man-in-the-middle attacks.",
    severity: "medium",
    severityScore: 6.5,
    affectedSoftware: ["OpenSSL 3.0.x", "OpenSSL 3.1.x"],
    publishedDate: "2024-01-05",
    updatedDate: "2024-01-12",
    cvssScore: 6.5,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N",
    cweId: "CWE-295",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-0123"]
  },
  {
    id: "CVE-2024-1234",
    cveId: "CVE-2024-1234",
    title: "MySQL Integer Overflow",
    description: "Integer overflow vulnerability in MySQL leads to denial of service.",
    severity: "medium",
    severityScore: 5.9,
    affectedSoftware: ["MySQL 5.7.x", "MySQL 8.0.x"],
    publishedDate: "2024-02-14",
    updatedDate: "2024-02-21",
    cvssScore: 5.9,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:H",
    cweId: "CWE-190",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-1234"]
  },
  {
    id: "CVE-2024-2345",
    cveId: "CVE-2024-2345",
    title: "Nginx Buffer Overflow",
    description: "Buffer overflow vulnerability in Nginx HTTP server allows DoS or information disclosure.",
    severity: "medium",
    severityScore: 7.3,
    affectedSoftware: ["Nginx 1.20.x", "Nginx 1.21.x", "Nginx 1.22.x"],
    publishedDate: "2024-01-20",
    updatedDate: "2024-01-27",
    cvssScore: 7.3,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:L",
    cweId: "CWE-120",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2024-2345"]
  },
  {
    id: "CVE-2023-4567",
    cveId: "CVE-2023-4567",
    title: "Log4j Information Disclosure",
    description: "Information disclosure vulnerability in Log4j allows sensitive data exposure through logs.",
    severity: "low",
    severityScore: 3.7,
    affectedSoftware: ["Log4j 2.17.x", "Log4j 2.18.x"],
    publishedDate: "2023-09-15",
    updatedDate: "2023-09-22",
    cvssScore: 3.7,
    cvssVector: "CVSS:3.1/AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:N/A:N",
    cweId: "CWE-200",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2023-4567"]
  },
  {
    id: "CVE-2023-3456",
    cveId: "CVE-2023-3456",
    title: "Java Deserialization RCE",
    description: "Remote code execution through unsafe Java deserialization in various libraries.",
    severity: "critical",
    severityScore: 9.3,
    affectedSoftware: ["Spring Framework 5.x", "Spring Boot 2.x"],
    publishedDate: "2023-08-10",
    updatedDate: "2023-08-17",
    cvssScore: 9.3,
    cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    cweId: "CWE-502",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2023-3456"]
  },
  {
    id: "CVE-2022-2222",
    cveId: "CVE-2022-2222",
    title: "Windows Kernel Vulnerability",
    description: "Windows Kernel elevation of privilege vulnerability affecting multiple Windows versions.",
    severity: "high",
    severityScore: 8.7,
    affectedSoftware: ["Windows 10 21H2", "Windows 11 21H2", "Windows Server 2022"],
    publishedDate: "2022-11-08",
    updatedDate: "2022-11-15",
    cvssScore: 8.7,
    cvssVector: "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H",
    cweId: "CWE-190",
    references: ["https://nvd.nist.gov/vuln/detail/CVE-2022-2222"]
  }
];

const getCVEById = (id) => {
  return cveDatabase.find(cve => cve.cveId === id || cve.id === id);
};

const filterCVEs = (filters) => {
  let result = [...cveDatabase];

  if (filters.severity) {
    result = result.filter(cve => cve.severity.toLowerCase() === filters.severity.toLowerCase());
  }

  if (filters.software) {
    result = result.filter(cve =>
      cve.affectedSoftware.some(soft =>
        soft.toLowerCase().includes(filters.software.toLowerCase())
      )
    );
  }

  if (filters.year) {
    result = result.filter(cve =>
      cve.publishedDate.startsWith(filters.year)
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(cve =>
      cve.cveId.toLowerCase().includes(searchLower) ||
      cve.title.toLowerCase().includes(searchLower) ||
      cve.description.toLowerCase().includes(searchLower)
    );
  }

  return result;
};

module.exports = {
  cveDatabase,
  getCVEById,
  filterCVEs
};
