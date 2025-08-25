# 👾 Stranger Face 🌍 - Cyberpunk Anime Social Hub

A production-ready, hobby-based video chat platform with cyberpunk anime aesthetics. Connect with strangers worldwide based on shared interests using WebRTC, Socket.io, and a futuristic 3D UI.

## 🚀 Features

- **Hobby-Based Matching**: Connect with people who share your interests (Music, Gaming, Art, etc.)
- **WebRTC Video Chat**: Real-time peer-to-peer video and audio communication
- **Cyberpunk Anime UI**: Futuristic 3D interface with neon effects and smooth animations
- **Global Connections**: IP-based country detection with flag display
- **No Registration Required**: Anonymous chat sessions
- **Real-time Reactions**: Floating emoji reactions with anime sparkle effects
- **Safety Features**: Report system and automatic moderation
- **Mobile Responsive**: Works perfectly on all devices
- **Production Ready**: Complete Docker deployment setup

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework
- **Cyberpunk CSS** - Custom animations and 3D effects
- **Socket.io Client** - Real-time communication
- **WebRTC** - Video/audio streaming

### Backend
- **Node.js + Express** - Server framework
- **Socket.io** - WebSocket signaling server
- **IP Geolocation APIs** - Country detection
- **Rate Limiting** - Security and spam prevention

### Deployment
- **Docker & Docker Compose** - Containerized deployment
- **Nginx** - Reverse proxy and load balancer

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose (optional)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd stranger-face
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies  
npm install

# Create environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

### 4. Access the Application

Open `http://localhost:3000` in your browser and start connecting!

## 🐳 Docker Deployment

### Development
```bash
docker-compose up --build
```

### Production
```bash
# Update environment variables in docker-compose.yml
# Configure SSL certificates in ./ssl/ directory
# Update domain names in nginx.conf

docker-compose -f docker-compose.yml up -d --build
```

## 🎯 How It Works

### User Flow
1. **Landing Page**: Users see cyberpunk anime interface
2. **Hobby Selection**: Choose from 8 hobby categories
3. **Matching**: System finds users with same hobby interest
4. **Video Chat**: WebRTC connection with anime UI effects
5. **Interactions**: Send emoji reactions, report users, find next match

### Hobby Categories
- 🎤 **Singing** - Connect with vocalists and music lovers
- 💃 **Dancing** - Meet dancers and movement enthusiasts
- 🎶 **Music** - Find musicians, producers, and fans
- 👨‍💻 **Coding** - Connect with developers and tech enthusiasts
- 🎮 **Gaming** - Meet gamers and esports fans
- 🎨 **Art** - Find artists, designers, and creatives
- 📚 **Books** - Connect with readers and literary enthusiasts
- ✈️ **Travel** - Meet travelers and adventure seekers

## ⚙️ Configuration

### Backend Environment (.env)
```env
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
SESSION_SECRET=your-secret-key
TURN_SERVER=turn:your-turn-server.com:3478
IPAPI_KEY=your-geolocation-api-key
```

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🔧 Development

### Project Structure
```
stranger-face/
├── backend/
│   ├── server.js              # Main server
│   ├── routes/                # API endpoints
│   ├── utils/                 # Utilities (geolocation, socket manager)
│   └── middleware/            # Rate limiting, security
├── frontend/
│   ├── index.html            # Main HTML file
│   ├── style.css             # Cyberpunk styles
│   ├── app.js                # Application logic
│   └── package.json          # Dependencies
├── deployment/
│   ├── docker-compose.yml    # Multi-container setup
│   └── nginx.conf           # Reverse proxy config
└── docs/                    # Documentation
```

### Key Components

#### Backend
- **WebRTC Signaling**: Handle offer/answer/ICE candidate exchange
- **Hobby Matching**: Match users based on selected interests
- **Geolocation**: Detect user country from IP address
- **Rate Limiting**: Prevent spam and abuse

#### Frontend
- **Cyberpunk UI**: Animated 3D effects and particle systems
- **Hobby Selection**: Interactive holographic card interface
- **Video Chat**: WebRTC integration with anime styling
- **Real-time Effects**: Floating emojis and connection celebrations

## 🚀 Deployment Guide

### VPS/Cloud Deployment
1. **Server Setup**: Ubuntu 20.04+ with Docker installed
2. **Domain Configuration**: Point domain to server IP
3. **SSL Setup**: Configure Let's Encrypt certificates
4. **Environment**: Update production environment variables
5. **Deploy**: Run `docker-compose up -d --build`

### Scaling Options
- **Load Balancing**: Add multiple backend instances
- **Database**: Integrate PostgreSQL for user data
- **CDN**: Use CloudFlare for static assets
- **Monitoring**: Add Prometheus and Grafana

## 🔐 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: API and WebSocket protection
- **CORS**: Configurable origin restrictions
- **Input Validation**: Joi schema validation
- **Report System**: User safety and moderation

## 📊 API Endpoints

### Chat Routes
- `GET /api/chat/location` - Get user's location
- `GET /api/chat/stats` - Platform statistics
- `GET /api/chat/test-connection` - WebRTC connectivity test

### Report Routes
- `POST /api/report` - Submit user report
- `GET /api/report/stats` - Report statistics (admin)

### WebSocket Events
- `set-hobby-preference` - Set user's hobby interest
- `find-match` - Start looking for compatible match
- `offer/answer/ice-candidate` - WebRTC signaling
- `next-stranger` - Find new match
- `report-user` - Report current user

## 🎨 Customization

### Themes
- Modify CSS variables in `style.css` for color schemes
- Update particle effects and animations
- Customize anime character assets

### Features
- Add new hobby categories in `hobbies` array
- Implement additional filters (age, location radius)
- Add premium features (video effects, custom emojis)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🆘 Support

- **Issues**: Open GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check `/docs` folder for detailed guides

## 🙏 Acknowledgments

- WebRTC community for excellent documentation
- Socket.io team for real-time communication
- Cyberpunk anime aesthetic inspiration
- Open source community contributions

---

**Ready to connect strangers through shared passions in a cyberpunk anime world? Let's build the future of social video chat! 🚀✨**
