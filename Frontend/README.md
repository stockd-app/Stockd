# Frontend Docker Setup

## Overview

The frontend is containerized using Docker with Nginx serving the built React application.

## Quick Start

### 1. Build the React app
```bash
npm install
npm run build
```

### 2. Start the container
```bash
chmod +x start.sh stop.sh
./start.sh
```

### 3. Access the app
Open browser: **http://localhost**

## How It Works

1. **Dockerfile** - Creates an Nginx container with your React app
2. **nginx-docker.conf** - Configures Nginx to:
   - Serve your React static files
   - Proxy `/api/*` requests to your backend (running separately)
   - Handle React Router (SPA routing)
3. **docker-compose.yml** - Manages the container lifecycle

## Commands

```bash
# Start container
./start.sh

# Stop container
./stop.sh

# View logs
docker-compose logs -f frontend

# Restart after changes
npm run build
docker-compose restart frontend

# Rebuild container
docker-compose up -d --build
```

## Configuration

### Change Port
If port 80 is busy, edit `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Changed from "80:80"
```
Then access: http://localhost:8080

### Backend Connection
The Nginx config proxies API requests to your backend. Make sure your backend is running on port 8000.

If backend is in a Docker container, update `nginx-docker.conf`:
```nginx
location /api/ {
    proxy_pass http://backend:8000;  # Use container name
}
```

If backend is running on your laptop (not in Docker):
```nginx
location /api/ {
    proxy_pass http://host.docker.internal:8000;  # Current setting
}
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs frontend

# Check if port is in use
lsof -i :80

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Changes not showing
```bash
# Rebuild React app
npm run build

# Restart container
docker-compose restart frontend
```

### API calls failing
- Make sure backend is running on port 8000
- Check nginx config has correct proxy_pass URL
- Check browser console for CORS errors


## Notes

- The `dist` folder is mounted as a volume, so rebuilding React updates the container automatically
- No need to rebuild the Docker image for frontend code changes
- Just run `npm run build` and restart the container
