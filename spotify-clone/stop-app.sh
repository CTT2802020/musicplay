#!/bin/bash

echo "🛑 Stopping Spotify Clone servers..."

# Kill processes on ports
echo "- Stopping app server on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process found on port 3000"

echo "- Stopping upload server on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process found on port 3001"

echo "- Stopping API server on port 3002..."
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "No process found on port 3002"

echo "✅ All servers stopped successfully!" 