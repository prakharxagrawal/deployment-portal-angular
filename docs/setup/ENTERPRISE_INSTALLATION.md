# 🏢 Enterprise Installation Guide

**Complete setup guide for deploying Deployment Portal in a new organization**

## 📋 **Table of Contents**
- [Prerequisites](#prerequisites)
- [Infrastructure Requirements](#infrastructure-requirements)
- [Database Setup](#database-setup)
- [Application Installation](#application-installation)
- [Configuration](#configuration)
- [Security Setup](#security-setup)
- [Initial Data Setup](#initial-data-setup)
- [Testing & Validation](#testing--validation)
- [Go-Live Checklist](#go-live-checklist)

---

## 🔧 **Prerequisites**

### **System Requirements**
- **Operating System**: Linux (Ubuntu 20.04+/RHEL 8+) or Windows Server 2019+
- **Java Runtime**: OpenJDK 17+ or Oracle JDK 17+
- **Node.js**: Version 18+ with npm
- **Database**: PostgreSQL 13+ or MySQL 8+
- **Web Server**: Nginx or Apache (optional, for production)
- **Memory**: Minimum 4GB RAM (8GB+ recommended)
- **Storage**: 50GB+ available disk space

### **Network Requirements**
- **Inbound Ports**: 
  - 8080 (Spring Boot backend)
  - 4200 (Angular frontend - development)
  - 80/443 (Web server - production)
- **Database Port**: 5432 (PostgreSQL) or 3306 (MySQL)
- **Firewall**: Allow communication between frontend, backend, and database

### **Software Dependencies**
```bash
# Install Java 17
sudo apt update
sudo apt install openjdk-17-jdk

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Maven
sudo apt install maven
```

---

## 🏗️ **Infrastructure Requirements**

### **Recommended Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│   Web Server    │────│   App Server    │
│   (Nginx/HAProxy)│    │   (Nginx)      │    │  (Spring Boot)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                               ┌─────────────────┐
                                               │    Database     │
                                               │  (PostgreSQL)   │
                                               └─────────────────┘
```

### **Deployment Scenarios**

#### **Option 1: Single Server (Small Organizations)**
- All components on one server
- Suitable for <100 users
- Minimum resource requirements

#### **Option 2: Multi-Server (Medium Organizations)**
- Separate database server
- Application server cluster
- Load balancer
- Suitable for 100-1000 users

#### **Option 3: Cloud Native (Large Organizations)**
- Container orchestration (Kubernetes)
- Cloud database (RDS/Cloud SQL)
- CDN for static assets
- Auto-scaling capabilities
- Suitable for 1000+ users

---

## 💾 **Database Setup**

### **PostgreSQL Installation & Configuration**

#### **1. Install PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# RHEL/CentOS
sudo dnf install postgresql postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### **2. Create Database and User**
```sql
-- Connect as postgres user
sudo -u postgres psql

-- Create database
CREATE DATABASE deployment_portal;

-- Create user with password
CREATE USER deployment_user WITH PASSWORD 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE deployment_portal TO deployment_user;

-- Grant schema privileges
\c deployment_portal
GRANT ALL ON SCHEMA public TO deployment_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO deployment_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO deployment_user;

-- Exit psql
\q
```

#### **3. Configure PostgreSQL**
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/13/main/postgresql.conf

# Key settings:
listen_addresses = '*'
port = 5432
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB

# Edit pg_hba.conf for authentication
sudo nano /etc/postgresql/13/main/pg_hba.conf

# Add line for application access:
host    deployment_portal    deployment_user    0.0.0.0/0    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### **MySQL Alternative Setup**
```sql
-- Create database
CREATE DATABASE deployment_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'deployment_user'@'%' IDENTIFIED BY 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON deployment_portal.* TO 'deployment_user'@'%';
FLUSH PRIVILEGES;
```

---

## 📦 **Application Installation**

### **1. Download and Prepare Source Code**
```bash
# Clone repository
git clone https://github.com/your-org/deployment-portal-angular.git
cd deployment-portal-angular

# Create application directory
sudo mkdir -p /opt/deployment-portal
sudo chown $USER:$USER /opt/deployment-portal
cp -r * /opt/deployment-portal/
cd /opt/deployment-portal
```

### **2. Backend Installation**
```bash
# Navigate to backend
cd backend/deployment-portal

# Update application.properties
nano src/main/resources/application.properties
```

**application.properties configuration:**
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/deployment_portal
spring.datasource.username=deployment_user
spring.datasource.password=secure_password_here
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Server Configuration
server.port=8080
server.servlet.context-path=/

# Session Configuration
server.servlet.session.timeout=30m
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true

# Logging Configuration
logging.level.com.deploymentportal=INFO
logging.file.name=/var/log/deployment-portal/application.log

# Production Settings
spring.profiles.active=production
```

```bash
# Build backend
mvn clean package -DskipTests

# Create service directory
sudo mkdir -p /var/log/deployment-portal
sudo chown $USER:$USER /var/log/deployment-portal
```

### **3. Frontend Installation**
```bash
# Navigate to frontend
cd ../../frontend/deployment-portal-frontend

# Install dependencies
npm install

# Update environment configuration
nano src/environments/environment.prod.ts
```

**environment.prod.ts configuration:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://your-server-ip:8080',
  apiEndpoint: '/api',
  sessionTimeout: 1800000, // 30 minutes
  enableLogging: false
};
```

```bash
# Build for production
npm run build

# Copy dist files to web server directory
sudo mkdir -p /var/www/deployment-portal
sudo cp -r dist/deployment-portal-frontend/* /var/www/deployment-portal/
sudo chown -R www-data:www-data /var/www/deployment-portal
```

---

## ⚙️ **Configuration**

### **1. System Service Configuration**

#### **Backend Service (systemd)**
```bash
# Create service file
sudo nano /etc/systemd/system/deployment-portal-backend.service
```

```ini
[Unit]
Description=Deployment Portal Backend
After=network.target

[Service]
Type=simple
User=deployment-portal
Group=deployment-portal
WorkingDirectory=/opt/deployment-portal/backend/deployment-portal
ExecStart=/usr/bin/java -jar target/deployment-portal-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10

Environment=SPRING_PROFILES_ACTIVE=production
Environment=JAVA_OPTS="-Xmx2g -Xms1g"

StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# Create service user
sudo useradd -r -s /bin/false deployment-portal
sudo chown -R deployment-portal:deployment-portal /opt/deployment-portal

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable deployment-portal-backend
sudo systemctl start deployment-portal-backend
```

### **2. Web Server Configuration (Nginx)**
```bash
# Install Nginx
sudo apt install nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/deployment-portal
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/deployment-portal;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Session cookie configuration
        proxy_cookie_path / "/; Secure; HttpOnly; SameSite=Strict";
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/deployment-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔐 **Security Setup**

### **1. SSL/TLS Configuration**
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **2. Firewall Configuration**
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow from trusted-network-range to any port 5432  # Database access
sudo ufw enable
```

### **3. Database Security**
```sql
-- Connect to PostgreSQL
sudo -u postgres psql

-- Remove default postgres user access
ALTER USER postgres PASSWORD 'strong_postgres_password';

-- Revoke public schema privileges
REVOKE ALL ON SCHEMA public FROM public;

-- Create read-only backup user
CREATE USER backup_user WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE deployment_portal TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
```

---

## 📊 **Initial Data Setup**

### **1. Database Schema Creation**
```bash
# The application will auto-create tables on first run
# Verify with:
sudo systemctl status deployment-portal-backend

# Check logs
sudo journalctl -u deployment-portal-backend -f
```

### **2. Initial Users Setup**
```sql
-- Connect to database
psql -h localhost -U deployment_user -d deployment_portal

-- Create initial superadmin
INSERT INTO users (username, password, role) VALUES 
('superadmin', 'admin123', 'superadmin'),
('admin1', 'admin123', 'admin'),
('dev1', 'dev123', 'developer');

-- Verify users
SELECT username, role FROM users;
```

### **3. Sample Data (Optional)**
```sql
-- Add sample services
INSERT INTO services (name) VALUES 
('auth-login-service'),
('pay-gateway-service'),
('user-profile-service');

-- Add sample releases
INSERT INTO releases (name, description) VALUES 
('2025-01', 'January 2025 release'),
('2025-02', 'February 2025 release');
```

---

## ✅ **Testing & Validation**

### **1. Service Health Checks**
```bash
# Check backend service
curl -f http://localhost:8080/api/services || echo "Backend not responding"

# Check database connection
sudo -u deployment-portal psql -h localhost -U deployment_user -d deployment_portal -c "SELECT 1;"

# Check frontend
curl -f http://your-domain.com || echo "Frontend not responding"
```

### **2. Functional Testing**
1. **Login Test**: Access the application and login as superadmin
2. **Create Request**: Create a sample deployment request
3. **Role Testing**: Login as different roles and verify permissions
4. **API Testing**: Test key API endpoints
5. **Data Export**: Test CSV export functionality

### **3. Performance Testing**
```bash
# Simple load test with curl
for i in {1..100}; do
    curl -s http://your-domain.com/api/services > /dev/null &
done
wait
```

---

## 🚀 **Go-Live Checklist**

### **Infrastructure Checklist**
- [ ] Database server configured and secured
- [ ] Application server configured with proper resources
- [ ] Web server configured with SSL/TLS
- [ ] Firewall rules configured
- [ ] Backup system configured
- [ ] Monitoring system configured
- [ ] Log rotation configured

### **Application Checklist**
- [ ] All services start automatically
- [ ] Database connection established
- [ ] Initial users created
- [ ] Sample data loaded (if required)
- [ ] All user roles tested
- [ ] API endpoints responding
- [ ] Frontend accessible

### **Security Checklist**
- [ ] SSL certificate installed and auto-renewing
- [ ] Database access restricted
- [ ] Application running as non-root user
- [ ] Security headers configured
- [ ] Session timeout configured
- [ ] Strong passwords enforced

### **Documentation Checklist**
- [ ] System architecture documented
- [ ] Access credentials secured
- [ ] User guides distributed
- [ ] Admin procedures documented
- [ ] Backup/recovery procedures tested
- [ ] Contact information updated

---

## 📞 **Support & Maintenance**

### **Log Locations**
- **Application Logs**: `/var/log/deployment-portal/application.log`
- **System Logs**: `sudo journalctl -u deployment-portal-backend`
- **Web Server Logs**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **Database Logs**: `/var/log/postgresql/postgresql-*.log`

### **Common Commands**
```bash
# Restart application
sudo systemctl restart deployment-portal-backend

# View logs
sudo journalctl -u deployment-portal-backend -f

# Check service status
sudo systemctl status deployment-portal-backend

# Database backup
pg_dump -h localhost -U deployment_user deployment_portal > backup_$(date +%Y%m%d).sql
```

### **Escalation Contacts**
- **System Administrator**: Contact for infrastructure issues
- **Database Administrator**: Contact for database issues  
- **Application Support**: Contact for application issues
- **Security Team**: Contact for security incidents

---

*This guide provides complete setup instructions for enterprise deployment. For additional support, refer to other documentation in the `/docs` directory.*
