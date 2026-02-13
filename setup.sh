#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script lives
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "$1" in
  client)
    echo -e "${BLUE}Starting Client...${NC}"
    cd "$ROOT_DIR/client"
    npm run build && npm run start
    ;;

  server)
    echo -e "${BLUE}Starting Server...${NC}"
    cd "$ROOT_DIR/server"
    npm run start:prod
    ;;

  python)
    echo -e "${BLUE}Starting Python API...${NC}"
    cd "$ROOT_DIR/python"
    source venv/bin/activate
    cd api
    python3 main.py
    ;;

  all)
    echo -e "${GREEN}Starting all services...${NC}"
    cd "$ROOT_DIR/client" && npm run build && npm run start &
    cd "$ROOT_DIR/server" && npm run start:prod &
    cd "$ROOT_DIR/python" && source venv/bin/activate && cd api && python3 main.py &
    wait
    ;;

  *)
    echo "Usage: ./setup.sh [client|server|python|all]"
    ;;
esac