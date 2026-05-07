/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        'surface-container-low': '#f1f5f9',
        'surface-container': '#e2e8f0',
        'surface-container-high': '#cbd5e1',
        'surface-container-highest': '#94a3b8',
        primary: '#6366f1', // Indigo
        'primary-container': '#e0e7ff',
        'on-primary-container': '#4338ca',
        secondary: '#0ea5e9', // Sky
        'secondary-container': '#e0f2fe',
        'outline-variant': '#e2e8f0',
        'on-surface': '#0f172a', // Slate 900
        'on-surface-variant': '#64748b' // Slate 500
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
