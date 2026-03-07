# Installation & Deployment Guide

## Quick Start

### Option 1: Automatic Setup (One Command)

#### Windows:
```batch
setup.bat
```

#### macOS/Linux:
```bash
bash setup.sh
```

This will install all dependencies for both frontend and backend.

### Option 2: Manual Setup

#### Backend Setup

1. Navigate to backend directory:
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

#### Frontend Setup

1. Open a new terminal and navigate to frontend directory:
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

The frontend will run on `http://localhost:3000`

### Option 3: Using Concurrently (Both at Once)

At root directory (requires `concurrently` to be installed):
```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and update values as needed:

```bash
cp .env.example .env
```

## Production Build

### Frontend Build

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Backend

The backend is ready for production as-is. For deployment:

1. Set `NODE_ENV=production`
2. Configure environment variables
3. Update CORS settings for your domain
4. Set up database (if using)

## Deployment Options

### Vercel (Frontend)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`

### Railway/Heroku (Backend)
1. Connect GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

## Docker Deployment (Optional)

### Backend Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Testing the API

### Using curl

```bash
# Get all CVEs
curl http://localhost:5000/api/cves

# Get critical CVEs
curl "http://localhost:5000/api/cves?severity=critical"

# Get single CVE
curl http://localhost:5000/api/cves/CVE-2024-1086

# Get statistics
curl http://localhost:5000/api/statistics
```

### Using Postman

1. Import the API endpoints
2. Create requests for each endpoint
3. Test with different query parameters
4. Save requests to collection

## Troubleshooting

### Port Already in Use

Change the port in configuration files:

**Backend (`backend/server.js`):**
```javascript
const PORT = process.env.PORT || 5001;
```

**Frontend (`frontend/vite.config.js`):**
```javascript
server: {
  port: 3001
}
```

### CORS Errors

Ensure backend CORS is properly configured in `backend/server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

### Module Not Found

Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues

1. Verify backend is running on correct port
2. Check API base URL in `frontend/src/services/api.js`
3. Ensure CORS is enabled on backend
4. Check browser console for errors

## Performance Optimization

### Frontend
- Enable GZIP compression
- Minify assets
- Use CDN for static files
- Implement lazy loading

### Backend
- Add caching headers
- Implement database indexing
- Use connection pooling
- Add rate limiting

## Monitoring & Logging

### Frontend
- Use browser DevTools
- Implement error tracking (e.g., Sentry)
- Monitor performance with Lighthouse

### Backend
- Log to console or file
- Monitor CPU and memory usage
- Track API response times
- Set up alerts for errors

## Version Management

Keep dependencies updated:

```bash
# Frontend
cd frontend
npm update

# Backend
cd backend
npm update
```

## Support

For issues or questions:
1. Check the README.md
2. Review API_DOCS.md
3. Check DEVELOPMENT.md
4. Open an issue on GitHub
