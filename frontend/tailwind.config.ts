import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#E8DCC4',
        'random-thoughts': '#FFD93D',
        school: '#6BCB77',
        personal: '#FF6B9D',
      },
    },
  },
  plugins: [],
}
export default config
