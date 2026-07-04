/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      colors: {
        base: '#07111f',
        panel: '#0b1728',
        panelRaised: '#101e33',
        field: '#081321',
        line: '#233753',
        lineSoft: '#16263d',
        ink: '#ffffff',
        inkDim: '#d7e6f4',
        inkFaint: '#90a9c5',
        amber: {
          DEFAULT: '#39ff5a',
          dim: '#27e86d',
        },
        teal: {
          DEFAULT: '#19cfff',
          dim: '#11e5d7',
        },
        rust: {
          DEFAULT: '#ff4d6d',
          dim: '#d43f5a',
        },
        violet: '#2b9cff',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', '"SF Mono"', 'monospace'],
      },
      backgroundImage: {
        'app-glow': 'radial-gradient(circle at 12% -10%, rgba(57, 255, 90, 0.07), transparent 40%)',
        'brand-title': 'linear-gradient(90deg, #39ff5a, #19cfff)',
        'progress-fill': 'linear-gradient(90deg, #27e86d, #39ff5a)',
        shimmer: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        brandGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(57, 255, 90, 0.25)' },
          '50%': { boxShadow: '0 0 18px rgba(25, 207, 255, 0.45)' },
        },
        shimmerMove: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        blinkCursor: {
          '50%': { opacity: '0' },
        },
        pulseBadge: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(57, 255, 90, 0.5)' },
          '50%': { opacity: '0.55', boxShadow: '0 0 0 4px rgba(57, 255, 90, 0)' },
        },
        loadingDots: {
          to: { width: '1.2em' },
        },
        drawerOpen: {
          from: { maxHeight: '0px' },
          to: { maxHeight: '480px' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.42s cubic-bezier(0.22, 1, 0.36, 1) both',
        'brand-glow': 'brandGlow 3.2s ease-in-out infinite',
        shimmer: 'shimmerMove 1.6s ease-in-out infinite',
        blink: 'blinkCursor 1s step-start infinite',
        'pulse-badge': 'pulseBadge 1.4s ease-in-out infinite',
        'loading-dots': 'loadingDots 1.4s steps(4, end) infinite',
        'drawer-open': 'drawerOpen 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
    },
  },
  plugins: [],
};
