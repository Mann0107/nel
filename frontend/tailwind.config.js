/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: {
            light: '#1B829D',
            DEFAULT: '#0D5C75',
            dark: '#063E50',
          },
          saffron: {
            light: '#FF8F6B',
            DEFAULT: '#FF6F3D',
            dark: '#E05320',
          },
          gold: {
            light: '#F4D068',
            DEFAULT: '#D4AF37',
            dark: '#B08E1A',
          },
        },
      },
    },
  },
  plugins: [],
}
