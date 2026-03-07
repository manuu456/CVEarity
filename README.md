# CVEarity - Vulnerability Intelligence Platform

A modern SaaS web application for tracking, analyzing, and automating responses to software vulnerabilities in real time.

## 🎯 Features

- **CVE Intelligence Dashboard**: Comprehensive vulnerability tracking with real-time metrics
- **Real-time Vulnerability Alerts**: Instant notifications for new critical vulnerabilities
- **Risk Scoring & Prioritization**: AI-powered severity assessment and threat prioritization
- **Security Automation & APIs**: Integrate with your existing security tools and workflows
- **Advanced Filtering**: Filter by severity, software, year, and search CVE IDs
- **Visual Analytics**: Charts showing severity distribution and vulnerability trends
- **Dark Cybersecurity Theme**: Professional SaaS design with glassmorphism effects

## 🏗️ Project Structure

```
cvearity/
├── frontend/                 # React.js Frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components (Landing, Dashboard)
│   │   ├── services/        # API service integrations
│   │   ├── App.jsx          # Main App component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # TailwindCSS configuration
│   └── package.json         # Frontend dependencies
│
└── backend/                 # Node.js + Express Backend
    ├── controllers/         # Request handlers
    ├── routes/              # API routes
    ├── models/              # Data models and mock data
    ├── server.js            # Express server entry point
    └── package.json         # Backend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## 📡 API Endpoints

### Get all CVEs
```
GET /api/cves
```

Query parameters:
- `severity`: Filter by severity (critical, high, medium, low)
- `software`: Filter by affected software name
- `year`: Filter by publication year
- `search`: Search by CVE ID or keyword

Example:
```
GET /api/cves?severity=critical&year=2024
```

### Get single CVE
```
GET /api/cves/:id
```

Example:
```
GET /api/cves/CVE-2024-1086
```

### Get statistics
```
GET /api/statistics
```

Returns vulnerability statistics including severity distribution and alerts.

## 🎨 Design Features

- **Dark Theme**: Cybersecurity-focused black and deep blue color scheme
- **Glassmorphism Cards**: Modern frosted glass effect with backdrop blur
- **Responsive Design**: Mobile-first design that works on all devices
- **Neon Accents**: Cyan and blue gradient accents for emphasis
- **Smooth Animations**: Hover effects and loading states
- **Professional Typography**: Clean, readable fonts with proper hierarchy

## 🔧 Tech Stack

### Frontend
- **React.js** - UI library
- **TailwindCSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls
- **Recharts** - Charts and graphs library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **CORS** - Cross-Origin Resource Sharing
- **Nodemon** - Auto-restart server during development

## 📊 Dashboard Features

### Vulnerability Table
- CVE ID with syntax highlighting
- Title and description
- Severity level with color-coded badges
- CVSS score
- Affected software
- Published date

### Statistics & Analytics
- Total vulnerability count
- Severity breakdown (Critical, High, Medium, Low)
- Pie chart showing severity distribution
- Bar chart showing vulnerabilities by year
- Recent critical alerts panel

### Advanced Filtering
- Search CVEs by ID or keyword
- Filter by severity level
- Filter by affected software
- Filter by publication year
- Clear all filters option

## 🔐 Security

CVEarity is designed with security best practices:
- Secure API endpoints with CORS validation
- Input validation and sanitization
- Error handling for all API calls
- No sensitive data stored in frontend
- HTTPS-ready architecture

## 📱 Responsive Design

- Desktop: Full-featured dashboard with all controls
- Tablet: Optimized layout with collapsible sections
- Mobile: Touch-friendly interface with stacked cards

## 🎓 Component Architecture

### Common Components
- `NavBar` - Navigation with logo and menu
- `Footer` - Footer with links and copyright
- `GlassmorphCard` - Reusable card component
- `SeverityBadge` - Severity level display
- `LoadingSkeleton` - Loading state animation
- `ErrorAlert` - Error message display

### Page Components
- `LandingPage` - Marketing homepage with features
- `DashboardPage` - Vulnerability analysis dashboard

## 🚦 Severity Levels

- **Critical (Red)** - CVSS 9.0-10.0 - Immediate action required
- **High (Orange)** - CVSS 7.0-8.9 - Urgent remediation needed
- **Medium (Yellow)** - CVSS 4.0-6.9 - Should be addressed
- **Low (Green)** - CVSS 0.1-3.9 - Monitor and plan

## 📈 Future Enhancements

- User authentication and authorization
- Custom alert thresholds
- Email notification system
- Integration with external CVE databases
- Real-time WebSocket updates
- Machine learning for threat prediction
- Multi-organization support
- Advanced reporting and export features

## 📝 License

MIT License - feel free to use this project for your portfolio or commercial purposes.

## 🤝 Contributing

This is a demo project for portfolio purposes. Contributions are welcome!

## 📧 Contact

For questions or suggestions, please reach out through the contact page on the CVEarity website.

---

**CVEarity** - Smarter Vulnerability Intelligence for Modern Security Teams
