import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rainy: {
          bg: '#2c3e50',
          accent: '#5dade2',
        },
        midnight: {
          bg: '#1a0a2e',
          accent: '#e94560',
        },
        forest: {
          bg: '#1a3a2e',
          accent: '#ff6b35',
        },
      },
    },
  },
  plugins: [],
};

export default config;
