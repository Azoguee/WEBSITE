# 🚀 Hướng dẫn Upload trực tiếp lên Hosting

## Phương án 1: Hosting Việt Nam (cPanel, DirectAdmin)

### Bước 1: Chuẩn bị file
```bash
# Tạo file .env cho production
cp env.example .env

# Cập nhật .env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
ZALO_OA_LINK="https://zalo.me/your-zalo-oa"
SITE_URL="https://your-domain.com"
```

### Bước 2: Build static files
```bash
# Cài đặt dependencies
npm install

# Build cho production
npm run build

# Tạo file .htaccess cho Apache
echo "RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]" > .htaccess
```

### Bước 3: Upload lên hosting
1. **Zip toàn bộ project** (trừ node_modules)
2. **Upload qua File Manager** hoặc FTP
3. **Extract** trong thư mục public_html
4. **Cài đặt Node.js** trên hosting (nếu chưa có)

### Bước 4: Setup database
1. **Tạo MySQL database** trong cPanel
2. **Cập nhật DATABASE_URL** trong .env
3. **Chạy migration**:
```bash
npm run db:push
npm run db:seed
npm run import:csv
```

### Bước 5: Chạy website
```bash
# Chạy với PM2
npm install -g pm2
pm2 start npm --name "ecommerce-website" -- start
pm2 save
pm2 startup
```

## Phương án 2: Hosting với Node.js Support

### Bước 1: Chuẩn bị
```bash
# Tạo file package.json cho hosting
{
  "name": "ecommerce-website",
  "version": "1.0.0",
  "scripts": {
    "start": "next start -p $PORT",
    "build": "next build",
    "dev": "next dev"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Bước 2: Upload và setup
```bash
# 1. Upload code lên hosting
# 2. SSH vào server
ssh user@your-domain.com

# 3. Cài đặt Node.js (nếu chưa có)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Cài đặt dependencies
npm install

# 5. Setup database
npm run db:push
npm run db:seed
npm run import:csv

# 6. Build và chạy
npm run build
npm start
```

## Phương án 3: Static Hosting (Netlify, Vercel)

### Bước 1: Build static
```bash
# Cài đặt adapter
npm install @netlify/plugin-nextjs

# Tạo netlify.toml
cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
EOF
```

### Bước 2: Deploy
```bash
# Build
npm run build

# Upload lên Netlify
npx netlify deploy --prod --dir=.next
```

## Phương án 4: VPS/Cloud Server

### Bước 1: Setup server
```bash
# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2
npm install -g pm2

# Cài đặt Nginx
sudo apt-get install nginx
```

### Bước 2: Upload code
```bash
# Clone repository
git clone <your-repo>
cd ecommerce-zalo-website

# Hoặc upload qua SCP
scp -r . user@server:/var/www/ecommerce-website
```

### Bước 3: Setup Nginx
```bash
# Tạo config Nginx
sudo nano /etc/nginx/sites-available/ecommerce-website

# Nội dung config:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ecommerce-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Bước 4: Chạy website
```bash
# Cài đặt dependencies
npm install

# Setup database
npm run db:push
npm run db:seed
npm run import:csv

# Build và chạy
npm run build
pm2 start npm --name "ecommerce-website" -- start
pm2 save
pm2 startup
```

## Phương án 5: Shared Hosting (cPanel)

### Bước 1: Chuẩn bị
```bash
# Tạo file .htaccess
cat > .htaccess << EOF
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
EOF
```

### Bước 2: Upload files
1. **Upload toàn bộ project** vào public_html
2. **Cài đặt Node.js** (nếu hosting hỗ trợ)
3. **Tạo database MySQL**
4. **Cập nhật .env**

### Bước 3: Setup
```bash
# SSH vào hosting
ssh user@your-domain.com

# Cài đặt dependencies
npm install

# Setup database
npm run db:push
npm run db:seed
npm run import:csv

# Chạy website
npm start
```

## Phương án 6: Docker trên Hosting

### Bước 1: Tạo Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Bước 2: Upload và chạy
```bash
# Build Docker image
docker build -t ecommerce-website .

# Chạy container
docker run -d -p 3000:3000 --name ecommerce-website ecommerce-website
```

## Quick Setup Script

Tạo file `setup-hosting.sh`:
```bash
#!/bin/bash

echo "🚀 Setting up website on hosting..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Check PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️ Setting up database..."
npm run db:generate
npm run db:push
npm run db:seed
npm run import:csv

# Build
echo "🏗️ Building website..."
npm run build

# Start with PM2
echo "🚀 Starting website..."
pm2 start npm --name "ecommerce-website" -- start
pm2 save
pm2 startup

echo "✅ Website setup completed!"
echo "🌐 Your website is running!"
```

## Environment Variables cho Hosting

Tạo file `.env`:
```env
# Database (MySQL/PostgreSQL)
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# App Configuration
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key-here"

# Zalo Configuration
ZALO_OA_LINK="https://zalo.me/your-zalo-oa-link"

# Analytics
GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
FACEBOOK_PIXEL_ID="your-facebook-pixel-id"

# Site Configuration
SITE_URL="https://your-domain.com"
SITE_NAME="Tài Khoản Siêu Rẻ"
```

## Troubleshooting

### Lỗi thường gặp:

1. **Node.js not found**
```bash
# Cài đặt Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Database connection failed**
```bash
# Kiểm tra database
mysql -u username -p
# Tạo database
CREATE DATABASE database_name;
```

3. **Port already in use**
```bash
# Kill process
lsof -ti:3000 | xargs kill -9
# Hoặc dùng port khác
PORT=3001 npm start
```

4. **Permission denied**
```bash
# Fix permissions
chmod +x setup-hosting.sh
sudo chown -R $USER:$USER /var/www/
```

## Monitoring

### Kiểm tra website
```bash
# Check status
pm2 status
pm2 logs ecommerce-website

# Check port
netstat -tlnp | grep :3000

# Check database
npm run db:push
```

### Backup
```bash
# Backup database
mysqldump -u username -p database_name > backup.sql

# Backup code
tar -czf backup.tar.gz .
```

Bạn muốn deploy lên hosting nào? Tôi sẽ hướng dẫn chi tiết hơn!
