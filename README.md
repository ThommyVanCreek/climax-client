# ClimaX Client

Vue 3 + Vite + Tailwind CSS web client for the ClimaX security system.

## Features

- **Dashboard** - Real-time system status, sensor overview, alarm controls
- **Sensors** - Detailed sensor list with contact state, battery, climate
- **Climate** - Temperature, humidity, and pressure readings
- **History** - Historical data visualization (requires database server)
- **Settings** - Theme, connection configuration

## Quick Start

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

Create `.env.local` for local development:

```env
# Bridge API URL
VITE_API_URL=http://climax-bridge.local

# API Key (for write operations)
VITE_API_KEY=your_api_key_here
```

## Docker Deployment

### Standalone

```bash
docker build -t climax-client .
docker run -p 3000:80 climax-client
```

### With Full Stack (from server project)

```bash
cd ../climax-database-server
docker-compose --profile client up -d
```

This starts:
- PostgreSQL database
- Flask API server (port 5000)
- Vue client (port 3000)

## Project Structure

```
src/
├── api/           # API client functions
├── assets/        # CSS, images
├── components/    # Reusable Vue components
├── router/        # Vue Router config
├── stores/        # Pinia stores
└── views/         # Page components
```

## Related Projects

- `climax-bridge/` - ESP32-C6 HomeKit bridge
- `climax-sensor/` - Battery-powered door/window sensors
- `climax-database-server/` - PostgreSQL + Flask API backend
