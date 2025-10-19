# 🚀 **Hostinger VPS Deployment Guide - Kyna Jewels Backend**

## 📋 **Overview**

This guide will help you deploy your Kyna Jewels backend on Hostinger VPS. The code is now optimized for VPS deployment with full file system access.

---

## 🏗️ **Hostinger VPS Setup**

### **1. VPS Requirements**
- **OS**: Ubuntu 20.04+ or CentOS 7+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB+ SSD
- **Node.js**: Version 18+ 
- **PM2**: Process manager for Node.js

### **2. Server Preparation**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install nginx -y

# Install MongoDB (or use MongoDB Atlas)
sudo apt install mongodb -y
```

---

## 📁 **File Structure on Hostinger VPS**

```
/var/www/kyna-jewels/
├── backend/
│   ├── dist/                 # Compiled TypeScript
│   ├── src/                  # Source code
│   ├── uploads/              # Local uploads (if needed)
│   ├── package.json
│   └── .env
├── public/
│   └── images/               # Product images
│       ├── rings/
│       ├── bracelets/
│       ├── pendants/
│       └── earrings/
└── logs/                     # Application logs
```

---

## 🔧 **Deployment Steps**

### **1. Upload Your Code**

```bash
# Clone your repository
cd /var/www/
git clone https://github.com/yourusername/kyna-jewels.git
cd kyna-jewels/server

# Install dependencies
npm install

# Build the project
npm run build
```

### **2. Environment Configuration**

Create `.env` file in `/var/www/kyna-jewels/server/`:

```bash
# ===========================================
# HOSTINGER VPS CONFIGURATION
# ===========================================

# Server Configuration
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com

# Database Configuration
MONGO_URI=mongodb://localhost:27017/kyna-jewels
# OR use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kyna-jewels

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-for-production
JWT_EXPIRES_IN=7d
JWT_COOKIE_SECURE=true

# Image Storage (Hostinger VPS)
IMAGE_BASE_URL=https://yourdomain.com/images
IMAGE_BASE_PATH=/var/www/kyna-jewels/public/images

# Cloudinary (User Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CCAvenue Payment Gateway
CCAVENUE_MERCHANT_ID=your_merchant_id
CCAVENUE_ACCESS_CODE=your_access_code
CCAVENUE_WORKING_KEY=your_working_key
CCAVENUE_PAYMENT_URL=https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourdomain.com

# Sequel247 Tracking
SEQUEL247_PROD_ENDPOINT=https://sequel247.com/
SEQUEL247_PROD_TOKEN=your_production_token
SEQUEL247_STORE_CODE=BLRAK

# Security
SESSION_SECRET=your-session-secret-key
COOKIE_SECRET=your-cookie-secret-key
```

### **3. Create Image Directories**

```bash
# Create image directories
sudo mkdir -p /var/www/kyna-jewels/public/images/{rings,bracelets,pendants,earrings,default}
sudo chown -R www-data:www-data /var/www/kyna-jewels/public/images
sudo chmod -R 755 /var/www/kyna-jewels/public/images
```

### **4. Configure Nginx Reverse Proxy**

Create `/etc/nginx/sites-available/kyna-jewels`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # API Backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static Images
    location /images {
        alias /var/www/kyna-jewels/public/images;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Frontend (if serving from same domain)
    location / {
        root /var/www/kyna-jewels/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/kyna-jewels /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **5. Setup SSL Certificate (Let's Encrypt)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### **6. Start Application with PM2**

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'kyna-jewels-backend',
    script: 'dist/app.js',
    cwd: '/var/www/kyna-jewels/server',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/kyna-jewels/error.log',
    out_file: '/var/log/kyna-jewels/out.log',
    log_file: '/var/log/kyna-jewels/combined.log',
    time: true
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/kyna-jewels
sudo chown -R $USER:$USER /var/log/kyna-jewels

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

---

## 🖼️ **Image Management on Hostinger VPS**

### **Product Images Structure**
```
/var/www/kyna-jewels/public/images/
├── rings/
│   ├── GR1-RD-70-2T-BR-RG-GP.jpg
│   ├── GR1-RD-70-2T-BR-RG-SIDE.jpg
│   └── ...
├── bracelets/
│   ├── BR1-RD-25-2T-PL-SL-GP.jpg
│   └── ...
├── pendants/
│   ├── PN1-EM-40-1T-BR-PT-18-GP.jpg
│   └── ...
├── earrings/
│   ├── ER1-MAR-60-2T-PL-RG-HOOP-GP.jpg
│   └── ...
└── default/
    └── product-placeholder.jpg
```

### **Upload Product Images**
```bash
# Upload your product images to the VPS
scp -r ./product-images/* user@yourdomain.com:/var/www/kyna-jewels/public/images/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/kyna-jewels/public/images
sudo chmod -R 755 /var/www/kyna-jewels/public/images
```

---

## 🔧 **Monitoring and Maintenance**

### **1. PM2 Commands**
```bash
# Check status
pm2 status

# View logs
pm2 logs kyna-jewels-backend

# Restart application
pm2 restart kyna-jewels-backend

# Stop application
pm2 stop kyna-jewels-backend

# Monitor
pm2 monit
```

### **2. Nginx Commands**
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### **3. Log Monitoring**
```bash
# Application logs
tail -f /var/log/kyna-jewels/combined.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🚀 **Deployment Commands**

### **Quick Deployment Script**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying Kyna Jewels Backend..."

# Navigate to project directory
cd /var/www/kyna-jewels/server

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build project
npm run build

# Restart PM2
pm2 restart kyna-jewels-backend

echo "✅ Deployment completed!"
```

Make it executable:
```bash
chmod +x deploy.sh
```

---

## ✅ **Verification**

### **Test Your Deployment**
```bash
# Check if application is running
curl https://yourdomain.com/api

# Test product images
curl https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg

# Test API endpoints
curl https://yourdomain.com/api/products
curl https://yourdomain.com/api/auth/test
```

---

## 🔒 **Security Considerations**

### **1. Firewall Setup**
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### **2. File Permissions**
```bash
# Secure your application files
sudo chown -R www-data:www-data /var/www/kyna-jewels
sudo chmod -R 755 /var/www/kyna-jewels
sudo chmod 600 /var/www/kyna-jewels/server/.env
```

### **3. Regular Updates**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /var/www/kyna-jewels/server
npm update
```

---

## 🎯 **Benefits of VPS Deployment**

✅ **Full Control**: Complete control over server environment  
✅ **File System Access**: Can use local file operations  
✅ **Cost Effective**: No serverless limitations  
✅ **Custom Configuration**: Full Nginx and server configuration  
✅ **Image Storage**: Direct access to product images  
✅ **Performance**: Dedicated resources for your application  

---

## 📞 **Troubleshooting**

### **Common Issues**

1. **Port 5000 not accessible**
   - Check if PM2 is running: `pm2 status`
   - Check Nginx configuration: `sudo nginx -t`

2. **Images not loading**
   - Check file permissions: `ls -la /var/www/kyna-jewels/public/images`
   - Check Nginx configuration for `/images` location

3. **Database connection issues**
   - Verify MongoDB is running: `sudo systemctl status mongodb`
   - Check connection string in `.env`

4. **SSL certificate issues**
   - Renew certificate: `sudo certbot renew`
   - Check certificate status: `sudo certbot certificates`

---

**Status**: ✅ **OPTIMIZED FOR HOSTINGER VPS**  
**File System**: ✅ **FULL ACCESS RESTORED**  
**Deployment**: ✅ **READY FOR VPS**  
**Last Updated**: January 2024
