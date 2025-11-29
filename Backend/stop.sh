#!/bin/bash

if [ -t 1 ]; then
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    GREEN=''
    BLUE=''
    NC=''
fi

echo -e "${BLUE}🛑 Stopping Stockd Backend container...${NC}"

docker-compose down

echo -e "${GREEN}✓${NC} Backend container stopped"
echo ""
echo "To start again, run: ./start.sh"
