import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A14',
        ink2: '#1A1A2E',
        ink3: '#253558',
        accent: '#6C3CE1',
        accent2: '#E1A83C',
        surf: '#F5F4F0',
        surf2: '#ECEAE4',
        teal: '#1D9E75',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
