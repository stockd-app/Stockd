#!/bin/bash

set -e

if [ -t 1 ]; then
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    NC='\033[0m'
else
    GREEN=''
    YELLOW=''
    RED=''
    BLUE=''
    CYAN=''
    NC=''
fi

echo -e "${CYAN}Starting All Stockd Services${NC}"
echo ""

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED} Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker is running"

# Check if Frontend is built
if [ ! -d "Frontend/dist" ]; then
    echo -e "${YELLOW}⚠${NC} Frontend not built. Building now..."
    cd Frontend
    npm install
    npm run build
    cd ..
    echo -e "${GREEN}✓${NC} Frontend built"
else
    echo -e "${GREEN}✓${NC} Frontend already built"
fi

# Check if Backend .env exists
if [ ! -f "Backend/.env" ]; then
    echo -e "${YELLOW}⚠${NC} Backend .env not found"
    echo "Please create Backend/.env from Backend/.env-sample"
    exit 1
fi

echo -e "${GREEN}✓${NC} Backend .env found"

echo ""
echo -e "${BLUE}Starting all services...${NC}"
docker-compose up -d

sleep 3

echo ""
echo -e "${BLUE}Service Status:${NC}"
echo ""

if docker ps | grep -q stockd-backend; then
    echo -e "${GREEN}✓${NC} Backend (FastAPI) - Running on port 8000"
else
    echo -e "${RED}✗${NC} Backend - Not running"
fi

if docker ps | grep -q stockd-frontend; then
    echo -e "${GREEN}✓${NC} Frontend (Nginx) - Running on port 80"
else
    echo -e "${RED}✗${NC} Frontend - Not running"
fi

echo ""
echo -e "${CYAN}All Services Started!${NC}"
echo ""
echo -e "${GREEN}Access your application:${NC}"
echo -e "  🌐 Frontend:  ${BLUE}http://localhost${NC}"
echo -e "  🔧 Backend:   ${BLUE}http://localhost:8000${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:     ${BLUE}docker-compose logs -f [service-name]${NC}"
echo -e "  Stop all:      ${BLUE}./stop-all.sh${NC} or ${BLUE}docker-compose down${NC}"
echo -e "  Restart:       ${BLUE}docker-compose restart [service-name]${NC}"
echo -e "  View status:   ${BLUE}docker-compose ps${NC}"
echo ""
