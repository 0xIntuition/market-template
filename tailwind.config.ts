import { themePreset } from '@0xintuition/1ui';
import containerQueries from '@tailwindcss/container-queries';

import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@0xintuition/1ui/dist/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [themePreset],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        typing: 'typing 1.5s ease-out infinite',
      },
      keyframes: {
        typing: {
          '0%': { opacity: '0.2' },
          '20%': { opacity: '1' },
          '100%': { opacity: '0.2' },
        },
      },
    },
  },
  plugins: [containerQueries],
} satisfies Config;

export default config;
