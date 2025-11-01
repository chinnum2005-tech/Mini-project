# BlockLearn Frontend

BlockLearn is a peer-to-peer learning platform that connects students and mentors for skill sharing and knowledge exchange. This repository contains the frontend application built with React, Vite, and Tailwind CSS.

## Features

- 🎓 **Skill Matching**: Connect with mentors based on skills and interests
- 💬 **Real-time Chat**: Communicate with mentors and students
- 📅 **Session Scheduling**: Schedule and manage learning sessions
- 🎥 **Video Conferencing**: Integrated support for Google Meet, Zoom, Skype, and Teams
- 🔐 **Google OAuth**: Secure authentication with Google accounts
- 📜 **Blockchain Certificates**: Earn verifiable certificates for completed sessions
- 📊 **Learning Analytics**: Track progress and performance
- 🌙 **Dark Mode**: Comfortable viewing in any lighting condition

## Tech Stack

- **Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **UI Components**: Radix UI, Shadcn UI
- **Animations**: Framer Motion, GSAP
- **Authentication**: Google OAuth 2.0
- **API Communication**: Axios
- **Voice Features**: Web Speech API
- **3D Graphics**: Three.js, React Three Fiber

## Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager
- Google OAuth credentials (for authentication)
- Backend API (see backend repository)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/blocklearn-frontend.git
cd blocklearn-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables (see Environment Variables section)

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# API Configuration
VITE_API_URL=http://localhost:5000/api

# Application Settings
VITE_APP_NAME=BlockLearn
VITE_APP_DESCRIPTION=Peer-to-Peer Learning Platform

# Feature Flags
VITE_ENABLE_VIDEO_CONFERENCING=true
VITE_ENABLE_BLOCKCHAIN_INTEGRATION=true
VITE_ENABLE_CHAT_FEATURES=true
```

For production deployment, use `.env.production` with your actual domain values.

## Deployment

### Netlify (Recommended)

1. Fork the repository
2. Connect to Netlify
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Vercel

1. Import the repository
2. Set build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variables

### Docker (Alternative)

Build and run with Docker:
```bash
docker build -t blocklearn-frontend .
docker run -p 8080:80 blocklearn-frontend
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── services/       # API service files
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── providers/      # Context providers
├── assets/         # Static assets
└── styles/         # Global styles
```

## Video Conferencing Integration

The platform supports integration with popular video conferencing platforms:

- **Google Meet**: Native integration
- **Zoom**: API integration
- **Microsoft Teams**: Link sharing
- **Skype**: Link sharing
- **Custom**: Support for any video platform

To configure video conferencing:
1. Set up API credentials for each platform
2. Update environment variables
3. Configure meeting link generation in the backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Ready to start learning?** Visit [BlockLearn](https://your-domain.com) to get started!