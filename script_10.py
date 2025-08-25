# Create frontend configuration files

# Frontend package.json for Next.js
frontend_package_json = '''{
  "name": "stranger-face-frontend",
  "version": "1.0.0",
  "description": "Cyberpunk anime video chat platform frontend",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "export": "next export"
  },
  "dependencies": {
    "next": "^15.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.7.4",
    "framer-motion": "^10.16.16",
    "three": "^0.158.0",
    "@react-three/fiber": "^8.15.12",
    "@react-three/drei": "^9.88.13",
    "framer-motion-3d": "^10.16.16",
    "axios": "^1.6.2",
    "use-sound": "^4.0.1",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.4",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.17",
    "@types/three": "^0.158.3",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-config-next": "^15.0.3",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}'''

# Next.js configuration
next_config_js = '''/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable experimental features
  experimental: {
    appDir: true,
  },
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  
  // Output configuration for static export if needed
  trailingSlash: true,
  
  // Webpack configuration for Three.js
  webpack: (config, { isServer }) => {
    // Fix for three.js
    config.module.rules.push({
      test: /\\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });
    
    return config;
  },
};

module.exports = nextConfig;
'''

# Tailwind configuration
tailwind_config_js = '''/** @type {import('tailwindcss').Config} */
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
'''

# Frontend .env.local.example
frontend_env_example = '''# Frontend Environment Variables
# Copy to .env.local and customize

# Backend URLs
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# For production deployment
# NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# WebRTC Configuration (optional)
# NEXT_PUBLIC_TURN_SERVER=turn:your-turn-server.com:3478
# NEXT_PUBLIC_TURN_USERNAME=username
# NEXT_PUBLIC_TURN_PASSWORD=password
'''

save_file('frontend-package.json', frontend_package_json)
save_file('frontend-next.config.js', next_config_js)
save_file('frontend-tailwind.config.js', tailwind_config_js)
save_file('frontend-env-example.txt', frontend_env_example)