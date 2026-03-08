module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SNIPER dark theme custom colors
        yellow: '#EAB308',           // amber — used for medium severity
        'bg-page': '#050505',
        'bg-card': '#0F0F0F',

        // Legacy tenable-* aliases → mapped to dark theme equivalents
        'tenable-grey-light': '#0F0F0F',      // was light grey bg → dark card bg
        'tenable-grey-medium': '#1F1F1F',     // was medium grey → dark border
        'tenable-grey-dark': '#050505',       // was dark grey → near-black
        'tenable-navy': '#FFFFFF',            // was navy text → white text (inverted)
        'tenable-navy-dark': '#F3F4F6',       // was dark navy → light grey text
        'tenable-yellow': '#E53E3E',          // was yellow accent → red accent
        'tenable-text-muted': '#9CA3AF',      // muted text stays grey
        'tenable-text-body': '#D1D5DB',       // body text → light grey

        slate: {
          950: '#020617'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    }
  },
  plugins: []
}
