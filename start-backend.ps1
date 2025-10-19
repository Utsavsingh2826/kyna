# Start Backend Server Script
Write-Host "Starting KYNA JEWELS Backend Server..." -ForegroundColor Green

# Navigate to server directory
Set-Location "server"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "Starting server on http://localhost:5000" -ForegroundColor Cyan
npm run dev
