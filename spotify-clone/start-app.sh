#!/bin/bash

echo "🎵 Starting Spotify Clone..."

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process on port 3000"
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process on port 3001"
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "No process on port 3002"

# Start API server in background
echo "🚀 Starting API server on port 3002..."
cd spotify-api/src && node server.js &
API_PID=$!

# Wait for API server to be ready
sleep 3

# Check if API server is running
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ API server is running"
else
    echo "❌ API server failed to start"
    kill $API_PID 2>/dev/null
    exit 1
fi

# Start upload server in background
echo "🚀 Starting upload server on port 3001..."
cd ../../ && node upload-server.js &
UPLOAD_PID=$!

# Wait for upload server to be ready
sleep 3

# Check if upload server is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Upload server is running"
else
    echo "❌ Upload server failed to start"
    kill $API_PID $UPLOAD_PID 2>/dev/null
    exit 1
fi

# Start app server
echo "🚀 Starting app server on port 3000..."
npx serve -s build -l 3000 &
APP_PID=$!

# Wait for app server to be ready
sleep 3

# Check if app server is running
if curl -s http://localhost:3000/ > /dev/null; then
    echo "✅ App server is running"
    echo ""
    echo "🎉 Spotify Clone is ready!"
    echo "📱 App: http://localhost:3000"
    echo "📁 Upload Server: http://localhost:3001"
    echo "🔌 API Server: http://localhost:3002"
    echo ""
    echo "💡 To stop all servers, press Ctrl+C or run: ./stop-app.sh"
    echo ""
else
    echo "❌ App server failed to start"
    kill $API_PID $UPLOAD_PID $APP_PID 2>/dev/null
    exit 1
fi

# Keep both servers running
wait 