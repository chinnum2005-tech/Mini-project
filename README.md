# BlockLearn - Peer-to-Peer Learning Platform

BlockLearn is a comprehensive peer-to-peer learning platform that connects students and mentors for skill sharing and knowledge exchange. The platform features integrated video conferencing, blockchain-verified certificates, real-time chat, and a sophisticated skill matching algorithm.

## 🌟 Key Features

### Learning & Collaboration
- **🎓 Skill Matching**: Intelligent algorithm to connect learners with mentors
- **📅 Session Scheduling**: Easy scheduling and management of learning sessions
- **💬 Real-time Chat**: Instant messaging with AI-powered assistance
- **🎥 Video Conferencing**: Integrated support for Google Meet, Zoom, Skype, and Teams
- **👥 Community Groups**: Join learning communities based on interests

### Authentication & Security
- **🔐 Google OAuth**: Secure single-sign-on with Google accounts
- **📧 Campus Email Verification**: OTP-based email verification system
- **🔒 JWT Authentication**: Secure token-based authentication
- **🛡️ Rate Limiting**: Protection against abuse and spam

### Verification & Tracking
- **📜 Blockchain Certificates**: Earn verifiable certificates stored on blockchain
- **📊 Learning Analytics**: Detailed progress tracking and insights
- **⭐ Feedback System**: Rate and review mentors and sessions
- **🏅 Skill Badges**: Gamified learning achievements

### Technology Integration
- **🌐 Modern Web Technologies**: React, Vite, Tailwind CSS
- **⛓️ Blockchain**: Solidity smart contracts for certificate verification
- **🔊 Voice Features**: Speech-to-text and text-to-speech capabilities
- **📱 Responsive Design**: Works on all devices

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Frontend      │    │    Backend       │    │   Blockchain     │
│   (React/Vite)  │◄──►│   (Node/Express) │◄──►│   (Solidity)     │
└─────────────────┘    └──────────────────┘    └──────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   PostgreSQL    │    │   Email Service  │    │  Ethereum Network│
│   Database      │    │   (Nodemailer)   │    │ (Smart Contracts)│
└─────────────────┘    └──────────────────┘    └──────────────────┘
```

## 📁 Project Structure

```
.
├── backend/                # Node.js Express backend
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models and SQL schemas
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   └── server.js           # Main server entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service files
│   │   ├── hooks/          # Custom React hooks
│   │   └── providers/      # Context providers
│   ├── public/             # Static assets
│   └── vite.config.js      # Vite configuration
├── contracts/              # Solidity smart contracts
├── scripts/                # Deployment scripts
└── testsprite_tests/       # Automated test cases
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or higher
- PostgreSQL database
- Google OAuth credentials
- Ethereum wallet (for blockchain features)

### Quick Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/blocklearn.git
cd blocklearn
```

2. **Install dependencies:**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

3. **Configure environment variables:**
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```

4. **Start development servers:**
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run client  # Frontend only
npm run server  # Backend only
```

### Docker Deployment

For containerized deployment:
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🎯 Deployment

### Production Deployment Guide
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Environment Variables
Each service requires specific environment variables. Refer to the `.env.example` files in each directory.

## 🧪 Testing

Run automated tests:
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📚 Documentation

- [Product Specification](./PRODUCT_SPECIFICATION.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [OAuth Configuration](./GOOGLE_OAUTH_SETUP.md)
- [API Documentation](./API_DOCS.md)
- [Smart Contracts](./contracts/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Start your learning journey today with BlockLearn!**