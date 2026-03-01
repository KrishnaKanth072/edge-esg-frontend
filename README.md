# EDGE ESG Frontend

Professional AI-powered ESG trading intelligence dashboard with glassmorphism design and real-time agent visualization.

## Features

- 10 AI agents with real-time status updates
- Quantum globe animation during analysis
- Glassmorphism UI with smooth animations
- WebSocket support for live backend updates
- Automatic fallback to demo mode if backend unavailable
- Keycloak authentication ready
- Production-ready Next.js 14 with TypeScript

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=edgeesg
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=edge-esg-frontend
```

## Backend Connection

The frontend automatically detects backend availability:
- **Connected**: Real-time data from microservices
- **Demo Mode**: Simulated data for testing

Ensure backend is running at `http://localhost:8000`

## Production Deployment

Deploy to Vercel (recommended):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Configure production environment variables in Vercel dashboard.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Keycloak.js
- WebSocket
