#!/bin/bash

# This script builds and starts the Nginx container for the frontend

set -e

if [ -t 1 ]; then
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    GREEN=''
    YELLOW=''
    RED=''
    BLUE=''
    NC=''
fi

echo -e "${BLUE}🟢 Starting Stockd Frontend (Nginx)${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠${NC} Frontend not built yet. Building now..."
    npm install
    npm run build
    echo -e "${GREEN}✓${NC} Frontend built successfully"
else
    echo -e "${GREEN}✓${NC} Frontend already built"
fi

# Start Nginx container
echo ""
echo -e "${BLUE}Starting Nginx container...${NC}"
docker-compose up -d

# Wait a moment for container to start
sleep 2

# Check if container is running
if docker ps | grep -q stockd-frontend; then
    echo -e "${GREEN}✓${NC} Nginx container is running"
else
    echo -e "${RED}❌ Failed to start Nginx container${NC}"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Frontend container started successfully!${NC}"
echo ""
echo "Access your app at: http://localhost"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f frontend"
echo "  - Stop: docker-compose down"
echo "  - Restart: docker-compose restart frontend"
echo ""
echo -e "${YELLOW}Note: Make sure your backend container is also running!${NC}"
echo ""