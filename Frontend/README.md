# 🎨 Stockd Frontend

React-based frontend application for the Stockd virtual pantry management system.

## 🛠️ Tech Stack

- **React** 18 with TypeScript
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS Modules** - Component-scoped styling
- **Nginx** - Production web server (Docker)

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for containerized setup)

## 🚀 Running the Frontend

### Option 1: With Docker Container (Recommended for Production)

**From Project Root:**
```bash
# Start all services (Frontend + Backend together)
./start-all.sh

# Stop all services
./stop-all.sh
```

**From Frontend Directory:**
```bash
# Build the React app first
npm install
npm run build

# Then start from project root
cd ..
./start-all.sh
```

Access the app at: **http://localhost**

### Option 2: Without Docker (Development Mode)

For active development with hot reload:

```bash
cd Frontend

# Install dependencies
npm install

# Set up environment variables
cp .env-sample .env
# Edit .env with your configuration

# Run development server
npm run dev
```

Access the app at: **http://localhost:5173**

**Note:** When running without Docker, make sure the backend is also running (see Backend README).

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── config/         # Configuration files
│   ├── assets/         # Images, fonts, etc.
│   └── styles/         # Global styles
├── dist/               # Production build output
├── Dockerfile          # Docker container definition
├── nginx-docker.conf   # Nginx configuration
└── vite.config.ts      # Vite configuration
```

## 🔧 Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🐳 Docker Setup Details

### How It Works

1. **Dockerfile** - Creates an Nginx container with your React app
2. **nginx-docker.conf** - Configures Nginx to:
   - Serve React static files
   - Proxy `/api/*` requests to backend container
   - Strip `/api` prefix before forwarding
   - Handle React Router (SPA routing)
3. **docker-compose.yml** (in project root) - Manages all containers

### API Proxying

The nginx config proxies API requests to the backend:

```nginx
location /api/ {
    rewrite ^/api/(.*) /$1 break;  # Strips /api prefix
    proxy_pass http://backend:8000;
}
```

**Example:**
- Frontend calls: `http://localhost/api/auth/google`
- Nginx forwards to: `http://backend:8000/auth/google`

**Important:** Both containers must be on the same Docker network (`stockd-network`).

## 🔌 Connecting with Backend

### With Docker
Both containers automatically connect via the `stockd-network`. No additional configuration needed.

### Without Docker
Update your API base URL in `src/config/consts.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:8000';
```

## 🛠️ Development Workflow

### For Active Development (Hot Reload)
```bash
npm run dev
```
Changes reflect immediately without rebuilding.

### For Testing Production Build
```bash
# Build the app
npm run build

# Start with Docker (from project root)
cd ..
./start-all.sh
```

### After Making Changes
```bash
# Rebuild React app
npm run build

# Restart container (from project root)
docker-compose restart frontend

# Or rebuild container if needed
docker-compose up -d --build frontend
```

## 📱 Mobile Testing

### Option 1: Local Network Access
1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
2. Access from mobile: `http://YOUR_LOCAL_IP` (e.g., `http://192.168.1.100`)

### Option 2: Browser DevTools
- Chrome/Edge: F12 → Toggle device toolbar (Ctrl+Shift+M)
- Firefox: F12 → Responsive Design Mode (Ctrl+Shift+M)

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs frontend

# Check if port 80 is in use
lsof -i :80  # macOS/Linux
netstat -ano | findstr :80  # Windows

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Changes Not Showing
```bash
# Rebuild React app
npm run build

# Restart container
docker-compose restart frontend

# Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
```

### API Calls Failing (404)
- Ensure backend container is running: `docker ps | grep stockd-backend`
- Check both containers are on same network: `docker network inspect stockd-network`
- Check nginx logs: `docker-compose logs frontend`

### API Calls Failing (500)
- This is a backend error, not frontend/nginx
- Check backend logs: `docker-compose logs backend`
- Verify backend `.env` configuration

### Build Errors
```bash
# Clean install
rm -rf node_modules dist
npm install
npm run build
```

## ⚙️ Configuration

### Change Port
If port 80 is busy, edit `docker-compose.yml` in project root:
```yaml
frontend:
  ports:
    - "8080:80"  # Changed from "80:80"
```
Then access: http://localhost:8080

### Environment Variables
Copy `.env-sample` to `.env` and configure:
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_client_id
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Build and test with Docker: `npm run build && docker-compose restart frontend`
5. Submit a pull request

---

For backend setup, see [Backend README](../Backend/README.md)
