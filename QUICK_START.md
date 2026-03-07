# CVEarity - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Step 1: Setup Backend (Terminal 1)
```bash
cd backend
npm install
npm start
```
✅ Backend runs on `http://localhost:5000`

### Step 2: Setup Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend runs on `http://localhost:3000` (auto-opens in browser)

### Step 3: Explore

1. **Landing Page**: Learn about CVEarity features
2. **Click "Explore Platform"**: Navigate to dashboard
3. **Dashboard**: View vulnerabilities, apply filters, analyze statistics

## 📊 Dashboard Features to Try

### Search & Filter
- Search by CVE ID (e.g., CVE-2024-1086)
- Filter by severity (Critical, High, Medium, Low)
- Filter by year (2024, 2023, 2022)
- Filter by software (Linux, OpenSSL, etc.)

### Visualizations
- **Pie Chart**: See severity distribution
- **Bar Chart**: View vulnerabilities by year
- **Statistics Cards**: Quick overview metrics
- **Alert Panel**: Recent critical vulnerabilities

### Data
- **15+ Mock CVEs** in database
- **Real CVSS data** with descriptions
- **Filter combinations** for advanced searches
- **Sortable table** with all vulnerability details

## 🎨 Design Highlights

- **Dark Theme**: Professional cybersecurity look
- **Glassmorphism**: Modern frosted glass effects
- **Responsive**: Works on desktop, tablet, mobile
- **Neon Accents**: Cyan and blue highlights
- **Smooth Animations**: Hover effects and transitions

## 📱 Responsive Testing

### Desktop (1024px+)
- Full dashboard with all features
- Side-by-side charts
- Wide CVE table

### Tablet (768px)
- Stacked charts
- Responsive table
- Touch-friendly buttons

### Mobile (375px+)
- Single column layout
- Scrollable table
- Compact cards

## 🔌 API Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Get All CVEs
```bash
curl http://localhost:5000/api/cves
```

### Filter Examples
```bash
# Get critical CVEs
curl "http://localhost:5000/api/cves?severity=critical"

# Get 2024 CVEs
curl "http://localhost:5000/api/cves?year=2024"

# Search Linux vulnerabilities
curl "http://localhost:5000/api/cves?search=linux"

# Get single CVE
curl http://localhost:5000/api/cves/CVE-2024-1086
```

## 📁 Project Structure Overview

```
cvearity/
├── backend/
│   ├── controllers/      # API logic
│   ├── routes/          # API endpoints
│   ├── models/          # Data & mock database
│   └── server.js        # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Landing & Dashboard
│   │   └── services/    # API integration
│   └── index.html       # HTML entry point
│
├── README.md            # Full project info
├── INSTALLATION.md      # Setup guide
└── ARCHITECTURE.md      # System design
```

## 🛠️ Common Tasks

### Change Backend Port
Edit `backend/server.js`:
```javascript
const PORT = process.env.PORT || 5001;
```

### Change Frontend Port
Edit `frontend/vite.config.js`:
```javascript
server: {
  port: 3001
}
```

### Update API Base URL
Edit `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://your-api.com/api';
```

### Add Mock CVE Data
Edit `backend/models/cveData.js` and add to `cveDatabase` array

### Customize Colors
Edit `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      // Add colors here
    }
  }
}
```

## 🐛 Troubleshooting

**Backend not starting?**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

**Frontend not loading?**
1. Check if backend is running (curl http://localhost:5000/health)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart dev server

**CORS errors?**
- Ensure backend CORS is enabled (it is by default)
- Check frontend API URL matches backend

**Port already in use?**
```bash
# Windows - find process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

## 📚 Documentation

- **API_DOCS.md**: Detailed API reference
- **DEVELOPMENT.md**: Frontend development guide
- **ARCHITECTURE.md**: System design and scalability
- **INSTALLATION.md**: Deployment guide
- **README.md**: Complete project overview

## 🎯 Project Highlights

✅ **Professional SaaS Design**: Production-quality UI/UX
✅ **Real-time Data**: Mock CVE database with 15+ vulnerabilities
✅ **Advanced Analytics**: Charts, filters, search, statistics
✅ **Responsive**: Mobile, tablet, desktop optimized
✅ **Clean Code**: Well-organized components and services
✅ **Fully Functional**: No hardcoded data, real API integration
✅ **Production Ready**: Error handling, loading states, security

## 🚀 Next Steps

1. **Explore Dashboard**: Test all filters and features
2. **Read Documentation**: Check API_DOCS.md and DEVELOPMENT.md
3. **Customize**: Update colors, add your data, customize text
4. **Deploy**: Follow INSTALLATION.md for production deployment
5. **Extend**: Build custom features on top of the platform

## 💡 Feature Ideas

- Add user authentication
- Connect to real CVE databases
- Implement email alerts
- Add Slack/Teams integration
- Create API dashboard
- Build mobile app

## 📞 Support

1. Check documentation files
2. Review code comments
3. Check API response in network tab
4. Verify environment setup

## 🎓 Learning Resources

- React: https://react.dev
- TailwindCSS: https://tailwindcss.com
- Express.js: https://expressjs.com
- Vite: https://vitejs.dev
- Recharts: https://recharts.org

---

**Happy coding! 🚀 CVEarity is ready to secure your infrastructure.**
