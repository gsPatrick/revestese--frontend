import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mjs}',
    './src/components/**/*.{js,ts,jsx,tsx,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        revesteCrimson: '#780e1a',
        revesteCrimsonDark: '#4a0811',
        revesteCrimsonDeeper: '#2e0509',
        revesteCrimsonLight: '#a01525',
        revesteGold: '#C9A84C',
        revesteGoldLight: '#E8C97A',
        revesteGoldDark: '#9A7A2E',
        revesteDark: '#120408',
        revesteDarkMid: '#2a0a10',
        revesteDarkSurface: '#1e0710',
        revesteCream: '#F5F0E8',
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant-next)', ...defaultTheme.fontFamily.serif],
        raleway: ['var(--font-raleway-next)', ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #9A7A2E, #E8C97A, #C9A84C, #9A7A2E)',
        'gradient-crimson': 'linear-gradient(135deg, #2e0509, #780e1a, #a01525)',
      },
      animation: {
        'shimmer-gold': 'shimmer-gold 4s linear infinite',
        'float-circular': 'float-circular 6s ease-in-out infinite',
        'marquee-slide': 'marquee-slide 30s linear infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
      },
    },
  },
  plugins: [],
};
