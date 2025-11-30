#!/bin/bash

# This script stops the Nginx container

if [ -t 1 ]; then
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    NC='\033[0m'
else
    GREEN=''
    BLUE=''
    NC=''
fi

echo -e "${BLUE}🛑 Stopping Stockd Frontend container...${NC}"

docker-compose down

echo -e "${GREEN}✓${NC} Frontend container stopped"
echo ""
echo "To start again, run: ./start.sh"
