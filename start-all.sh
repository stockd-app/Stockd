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
    echo -e "${RED}Docker is not running!${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}Docker is running${NC}"

# Check if Frontend is built
if [ ! -d "Frontend/dist" ]; then
    echo -e "${YELLOW}Frontend not built. Building now...${NC}"
    cd Frontend
    npm install
    npm run build
    cd ..
    echo -e "${GREEN}Frontend built${NC}"
else
    echo -e "${GREEN}Frontend already built${NC}"
fi

# Check if Backend .env exists
if [ ! -f "Backend/.env" ]; then
    echo -e "${YELLOW}Backend .env not found${NC}"
    echo "Please create Backend/.env from Backend/.env-sample"
    exit 1
fi

echo -e "${GREEN}Backend .env found${NC}"

echo ""
echo -e "${BLUE}Starting all services...${NC}"
docker-compose up -d

sleep 3

echo ""
echo -e "${BLUE}Service Status:${NC}"
echo ""

if docker ps | grep -q stockd-backend; then
    echo -e "${GREEN}Backend (FastAPI) - Running on port 8000${NC}"
else
    echo -e "${RED}Backend - Not running${NC}"
fi

if docker ps | grep -q stockd-food-classifier; then
    echo -e "${GREEN}Food Classifier AI - Running on port 9002${NC}"
else
    echo -e "${RED}Food Classifier AI - Not running${NC}"
fi

if docker ps | grep -q stockd-recipe-recommender; then
    echo -e "${GREEN}Recipe Recommender AI - Running on port 9001${NC}"
else
    echo -e "${RED}Recipe Recommender AI - Not running${NC}"
fi

if docker ps | grep -q stockd-frontend; then
    echo -e "${GREEN}Frontend (Nginx) - Running on port 80${NC}"
else
    echo -e "${RED}Frontend - Not running${NC}"
fi

echo ""
echo -e "${CYAN}All Services Started!${NC}"
echo ""
echo -e "${GREEN}Access your application:${NC}"
echo -e "  Frontend:           ${BLUE}http://localhost${NC}"
echo -e "  Backend:        ${BLUE}http://localhost:8000${NC}"
echo -e "  Food Classifier:    ${BLUE}http://localhost:9002${NC}"
echo -e "  Recipe Recommender: ${BLUE}http://localhost:9001${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:     ${BLUE}docker-compose logs -f [service-name]${NC}"
echo -e "  Stop all:      ${BLUE}./stop-all.sh${NC} or ${BLUE}docker-compose down${NC}"
echo -e "  Restart:       ${BLUE}docker-compose restart [service-name]${NC}"
echo -e "  View status:   ${BLUE}docker-compose ps${NC}"
echo ""
