# 🚀 Stranger Face - Run Instructions

## Quick Start (Recommended)

### Option 1: Docker Compose (Easiest)
```bash
# Clone the repository
git clone <repository-url>
cd stranger-face

# Start all services
docker-compose up --build

# Access the application
open http://localhost:3000
```

### Option 2: Manual Setup

#### Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start backend server
npm run dev
# Server runs on http://localhost:5000
```

#### Frontend Setup (New Terminal)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start frontend
npm run dev
# Frontend runs on http://localhost:3000
```

## Production Deployment

### 1. Environment Setup
Update production environment variables:

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
SESSION_SECRET=your-super-secret-production-key
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 2. Docker Production Deploy
```bash
# Update docker-compose.yml with production settings
# Configure SSL certificates in ./ssl/
# Update nginx.conf with your domain

docker-compose -f docker-compose.yml up -d --build
```

### 3. Manual Production Deploy

**Backend:**
```bash
cd backend
npm install --production
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
npm start
```

## Environment Variables

### Backend Required
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGINS` - Allowed origins (comma-separated)
- `SESSION_SECRET` - Session encryption key

### Backend Optional
- `TURN_SERVER` - WebRTC TURN server URL
- `TURN_USERNAME` - TURN server username
- `TURN_PASSWORD` - TURN server password
- `IPAPI_KEY` - Enhanced geolocation API key

### Frontend Required
- `NEXT_PUBLIC_SOCKET_URL` - Backend WebSocket URL
- `NEXT_PUBLIC_API_URL` - Backend API URL

## Verification Steps

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Frontend Access:**
   - Open `http://localhost:3000`
   - Should see cyberpunk anime homepage

3. **WebSocket Connection:**
   - Check browser console for connection logs
   - Test hobby selection and matching

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check Node.js version (18+ required)
- Verify all dependencies installed
- Check port 5000 availability

**Frontend connection errors:**
- Verify backend is running
- Check CORS origins configuration
- Ensure WebSocket URLs are correct

**Docker issues:**
- Ensure Docker and Docker Compose installed
- Check port conflicts (3000, 5000)
- Verify Docker daemon is running

### Port Conflicts
If ports are in use, update in:
- `docker-compose.yml`
- Backend `.env` file
- Frontend environment variables

### Performance
For better development performance:
- Use `npm run dev` for hot reloading
- Enable browser dev tools for debugging
- Monitor WebSocket connections in Network tab

## Next Steps

1. **Customize**: Modify colors, add hobbies, customize UI
2. **Deploy**: Set up production server with SSL
3. **Scale**: Add Redis, PostgreSQL, load balancing
4. **Monitor**: Implement logging and analytics

**Happy coding! 🎌✨**
