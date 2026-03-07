# CVEarity Backend API Documentation

## Overview

CVEarity backend is a Node.js Express server that provides REST APIs for vulnerability intelligence and CVE data management.

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### 1. Get All CVEs

**Request:**
```http
GET /cves
```

**Query Parameters:**
- `severity` (optional): Filter by severity level
  - Values: `critical`, `high`, `medium`, `low`
- `software` (optional): Filter by affected software name
- `year` (optional): Filter by publication year (YYYY)
- `search` (optional): Search by CVE ID or keyword

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "CVE-2024-1086",
      "cveId": "CVE-2024-1086",
      "title": "Linux Kernel Privilege Escalation",
      "description": "A use-after-free vulnerability...",
      "severity": "critical",
      "severityScore": 9.8,
      "affectedSoftware": ["Linux Kernel 5.x", "Linux Kernel 6.x"],
      "publishedDate": "2024-01-15",
      "cvssScore": 9.8,
      "cvssVector": "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
      "cweId": "CWE-416"
    }
  ],
  "total": 1
}
```

**Examples:**

Get all critical CVEs:
```
GET /cves?severity=critical
```

Get CVEs for a specific year:
```
GET /cves?year=2024
```

Search for CVEs related to Linux:
```
GET /cves?search=linux
```

Combine multiple filters:
```
GET /cves?severity=high&year=2024&software=openssl
```

### 2. Get Single CVE

**Request:**
```http
GET /cves/:id
```

**Path Parameters:**
- `id` (required): CVE ID (e.g., CVE-2024-1086)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "CVE-2024-1086",
    "cveId": "CVE-2024-1086",
    "title": "Linux Kernel Privilege Escalation",
    "description": "A use-after-free vulnerability in the Linux kernel networking subsystem could allow a local attacker to elevate privileges.",
    "severity": "critical",
    "severityScore": 9.8,
    "affectedSoftware": ["Linux Kernel 5.x", "Linux Kernel 6.x"],
    "publishedDate": "2024-01-15",
    "updatedDate": "2024-01-20",
    "cvssScore": 9.8,
    "cvssVector": "CVSS:3.1/AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    "cweId": "CWE-416",
    "references": ["https://nvd.nist.gov/vuln/detail/CVE-2024-1086"]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "CVE CVE-9999-9999 not found"
}
```

### 3. Get Statistics

**Request:**
```http
GET /statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCVEs": 15,
    "bySeverity": {
      "critical": 5,
      "high": 4,
      "medium": 4,
      "low": 2
    },
    "byYear": {
      "2022": 1,
      "2023": 2,
      "2024": 12
    },
    "recentAlerts": [
      {
        "id": "CVE-2024-1086",
        "cveId": "CVE-2024-1086",
        "title": "Linux Kernel Privilege Escalation",
        "severity": "critical"
      }
    ]
  }
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

**HTTP Status Codes:**
- `200 OK`: Request successful
- `404 Not Found`: CVE not found
- `500 Internal Server Error`: Server error

## Data Model

### CVE Object

```javascript
{
  id: string,              // Unique identifier
  cveId: string,           // CVE ID (e.g., CVE-2024-1086)
  title: string,           // Vulnerability title
  description: string,     // Detailed description
  severity: string,        // 'critical' | 'high' | 'medium' | 'low'
  severityScore: number,   // 0-10 score
  affectedSoftware: string[], // List of affected software/products
  publishedDate: string,   // YYYY-MM-DD format
  updatedDate: string,     // YYYY-MM-DD format
  cvssScore: number,       // CVSS severity score
  cvssVector: string,      // CVSS vector string
  cweId: string,          // CWE ID
  references: string[]    // Reference URLs
}
```

## Development

### Running the server

```bash
# Install dependencies
npm install

# Start server (production)
npm start

# Start server with auto-reload (development)
npm run dev
```

The server will start on `http://localhost:5000`

### Check server health

```bash
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "Server is running"
}
```

## CORS Support

The API supports Cross-Origin Resource Sharing (CORS) for frontend applications running on different origins.

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider adding rate limiting middleware.

## Authentication

Currently, the API does not require authentication. For production use, consider implementing JWT or API key authentication.

## Future Improvements

- Real-time CVE database integration
- Advanced filtering with complex queries
- Pagination support for large datasets
- Webhook notifications
- API authentication and authorization
- Rate limiting and throttling
- Caching layer for performance
- Database persistence (MongoDB, PostgreSQL)
- Advanced analytics and reporting
