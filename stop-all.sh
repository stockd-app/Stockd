#!/bin/bash

if [ -t 1 ]; then
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    NC='\033[0m'
else
    GREEN=''
    BLUE=''
    CYAN=''
    NC=''
fi

echo -e "${CYAN}Stopping All Stockd Services ${NC}"
echo ""

docker-compose down

echo ""
echo -e "${GREEN}✓${NC} All services stopped"
echo ""
echo "To start again, run: ${BLUE}./start-all.sh${NC}"
echo ""
