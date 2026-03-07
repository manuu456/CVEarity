# CVEarity Frontend Development Guide

## Overview

The CVEarity frontend is a React.js application built with Vite, TailwindCSS, and modern web technologies. It provides a professional vulnerability intelligence dashboard and landing page.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── common.jsx           # Reusable UI components
│   ├── pages/
│   │   ├── LandingPage.jsx      # Marketing landing page
│   │   └── DashboardPage.jsx    # Vulnerability dashboard
│   ├── services/
│   │   └── api.js               # API integration
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── index.html                   # HTML template
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # TailwindCSS configuration
├── postcss.config.js            # PostCSS configuration
└── package.json                 # Dependencies
```

## Components

### Common Components (`src/components/common.jsx`)

#### NavBar
Navigation bar with logo, menu, and sign-in button.

```jsx
<NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
```

Props:
- `currentPage`: Current page state
- `setCurrentPage`: Function to change page

#### Footer
Footer with links and branding information.

```jsx
<Footer />
```

#### GlassmorphCard
Reusable card component with glassmorphism effect.

```jsx
<GlassmorphCard className="mb-8">
  <div>Content</div>
</GlassmorphCard>
```

Props:
- `className`: Additional CSS classes
- `children`: Card content

#### SeverityBadge
Display CVE severity level with color coding.

```jsx
<SeverityBadge severity="critical" />
```

Props:
- `severity`: Severity level ('critical', 'high', 'medium', 'low')

#### LoadingSkeleton
Animated loading skeleton for data loading states.

```jsx
<LoadingSkeleton />
```

#### ErrorAlert
Display error messages to users.

```jsx
<ErrorAlert message="Failed to fetch data" />
```

Props:
- `message`: Error message text

## Pages

### LandingPage
Marketing homepage with:
- Hero section with CTA buttons
- Feature cards
- How it works section
- Product preview
- Integrations showcase
- Benefits section
- Call to action
- Footer

### DashboardPage
Vulnerability analysis dashboard with:
- Statistics cards
- Severity distribution pie chart
- CVE trends bar chart
- Recent alerts panel
- Advanced filters
- Searchable vulnerability table
- Loading states
- Error handling

## API Integration

### Service (`src/services/api.js`)

The API service handles all backend communication using Axios.

**Methods:**

```javascript
// Get all CVEs with optional filters
const data = await getCVEs({ severity: 'critical', year: 2024 });

// Get single CVE
const cve = await getCVEById('CVE-2024-1086');

// Get statistics
const stats = await getStatistics();
```

## Styling

### TailwindCSS

The project uses TailwindCSS for utility-first styling. Key classes:

- **Colors**: `text-cyan-400`, `bg-slate-950`, `border-cyan-500`
- **Spacing**: `px-4`, `py-3`, `gap-4`, `mb-8`
- **Effects**: `backdrop-blur-lg`, `rounded-lg`, `border`
- **Responsive**: `md:`, `lg:`, `sm:`

### Dark Theme Customization

Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      // Add custom colors here
    }
  }
}
```

## Component Examples

### Creating a New Page

```jsx
export const NewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data
        setError(null);
      } catch (err) {
        setError('Error message');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="bg-gradient-to-br from-slate-950 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page content */}
      </div>
    </main>
  );
};
```

### Creating a Reusable Component

```jsx
export const MyComponent = ({ title, children, className = '' }) => {
  return (
    <GlassmorphCard className={className}>
      <h3 className="text-white font-bold mb-4">{title}</h3>
      {children}
    </GlassmorphCard>
  );
};
```

## Development Workflow

### Running Development Server

```bash
npm run dev
```

Opens on `http://localhost:3000` with hot module replacement (HMR).

### Building for Production

```bash
npm run build
```

Creates optimized build in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Responsive Design

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Example

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Columns: 1 on mobile, 2 on tablet, 4 on desktop */}
</div>
```

## Performance Optimization

### Code Splitting

Lazy load heavy components:

```jsx
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
```

### Memoization

Prevent unnecessary re-renders:

```jsx
export const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port 3000 Already in Use

Change port in `vite.config.js`:

```javascript
server: {
  port: 3001
}
```

### CSS Not Loading

Ensure TailwindCSS is properly configured:
1. Check `tailwind.config.js`
2. Verify `index.css` imports
3. Restart dev server

### API Errors

Check backend server is running on `http://localhost:5000`:

```bash
curl http://localhost:5000/health
```

## Future Enhancements

- TypeScript integration
- Unit testing with Jest
- E2E testing with Cypress
- State management (Redux/Zustand)
- Dark/Light theme toggle
- User authentication UI
- Advanced charting library
- Real-time WebSocket updates
