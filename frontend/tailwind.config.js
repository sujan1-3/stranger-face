/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html',
    './app.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cyberpunk color palette
        'neon-blue': '#00FFFF',
        'neon-pink': '#FF1493', 
        'neon-purple': '#8A2BE2',
        'neon-green': '#00FF41',
        'cyber-dark': '#0A0A0F',
        'cyber-gray': '#1A1A2E',

        // Hobby colors
        'hobby-singing': '#FF69B4',
        'hobby-dancing': '#FF6B35',
        'hobby-music': '#8B5CF6',
        'hobby-coding': '#00D4AA',
        'hobby-gaming': '#3B82F6',
        'hobby-art': '#F59E0B',
        'hobby-books': '#10B981',
        'hobby-travel': '#06B6D4',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'particle': 'particle 20s linear infinite',
        'bounce-slow': 'bounce 3s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'text-glow': 'text-glow 3s ease-in-out infinite',
        'bounce-emoji': 'bounce-emoji 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)',
            transform: 'scale(1.05)'
          },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        particle: {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(360deg)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px var(--neon-blue)' },
          '50%': { boxShadow: '0 0 40px var(--neon-blue), 0 0 60px var(--neon-blue)' },
        },
        'text-glow': {
          '0%, 100%': { textShadow: '0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue)' },
          '50%': { textShadow: '0 0 20px var(--neon-pink), 0 0 30px var(--neon-pink), 0 0 40px var(--neon-pink)' },
        },
        'bounce-emoji': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '25%': { transform: 'translateY(-5px)' },
          '75%': { transform: 'translateY(-2px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
