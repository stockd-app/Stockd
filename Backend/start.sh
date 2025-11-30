#!/bin/bash

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

echo -e "${BLUE}🟢 Starting Stockd Backend (FastAPI)${NC}"
echo ""

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC} No .env file found"
    if [ -f ".env-sample" ]; then
        echo "Copy .env-sample to .env and add your credentials"
    fi
    exit 1
fi

echo -e "${GREEN}✓${NC} Environment file found"

echo ""
echo -e "${BLUE}Starting Backend container...${NC}"
docker-compose up -d

sleep 2

if docker ps | grep -q stockd-backend; then
    echo -e "${GREEN}✓${NC} Backend container is running"
else
    echo -e "${RED}❌ Failed to start Backend container${NC}"
    docker-compose logs backend
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Backend started successfully!${NC}"
echo ""
echo "Access your API at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f backend"
echo "  - Stop: docker-compose down"
echo "  - Restart: docker-compose restart backend"
echo ""
