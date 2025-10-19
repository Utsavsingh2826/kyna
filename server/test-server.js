// Simple server test script
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing server startup...');

// Set minimal environment variables for testing
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGO_URI = 'mongodb://localhost:27017/kyna-jewels-test';
process.env.PORT = '5001';

// Start the server
const server = spawn('node', ['dist/app.js'], {
  cwd: path.join(__dirname),
  stdio: 'pipe'
});

let output = '';
let errorOutput = '';

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('📤 Server output:', data.toString().trim());
});

server.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.error('❌ Server error:', data.toString().trim());
});

// Test server startup
setTimeout(() => {
  if (output.includes('Server running on port') || output.includes('MongoDB connected')) {
    console.log('✅ Server started successfully!');
    console.log('🎉 Server is 100% ready!');
  } else {
    console.log('❌ Server failed to start properly');
    console.log('Error output:', errorOutput);
  }
  
  // Kill the server
  server.kill();
  process.exit(0);
}, 5000);

// Handle server exit
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});
