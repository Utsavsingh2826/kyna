# Start Frontend Server Script
Write-Host "Starting KYNA JEWELS Frontend Server..." -ForegroundColor Green

# Navigate to client directory
Set-Location "client"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "Starting frontend on http://localhost:5173" -ForegroundColor Cyan
npm run dev
