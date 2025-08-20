# 💾 Database Setup Guide

**Comprehensive database setup, configuration, and hosting guide for Deployment Portal**

## 📋 **Table of Contents**
- [Database Requirements](#database-requirements)
- [PostgreSQL Setup](#postgresql-setup)
- [MySQL Setup (Alternative)](#mysql-setup-alternative)
- [Schema Creation](#schema-creation)
- [Performance Tuning](#performance-tuning)
- [Security Configuration](#security-configuration)
- [Backup & Recovery](#backup--recovery)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Cloud Database Setup](#cloud-database-setup)

---

## 🔧 **Database Requirements**

### **Supported Databases**
- **PostgreSQL 13+** (Recommended)
- **MySQL 8.0+** (Alternative)
- **MariaDB 10.6+** (Alternative)

### **Resource Requirements**

#### **Small Deployment (<100 users)**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **IOPS**: 1,000

#### **Medium Deployment (100-1000 users)**
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 200GB SSD
- **IOPS**: 3,000

#### **Large Deployment (1000+ users)**
- **CPU**: 8+ cores
- **RAM**: 16GB+
- **Storage**: 500GB+ SSD
- **IOPS**: 10,000+

### **Network Requirements**
- **Latency**: <5ms between application and database
- **Bandwidth**: 1Gbps for large deployments
- **Availability**: 99.9% uptime SLA

---

## 🐘 **PostgreSQL Setup**

### **Installation on Ubuntu/Debian**
```bash
# Update package list
sudo apt update

# Install PostgreSQL and contributions
sudo apt install postgresql postgresql-contrib postgresql-client

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
sudo systemctl status postgresql
psql --version
```

### **Installation on RHEL/CentOS**
```bash
# Install PostgreSQL repository
sudo dnf install https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Install PostgreSQL
sudo dnf install postgresql15-server postgresql15-contrib

# Initialize database
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

### **Initial Configuration**
```bash
# Switch to postgres user
sudo -i -u postgres

# Access PostgreSQL prompt
psql

# Check version and status
SELECT version();
\l  # List databases
\q  # Quit
```

### **Create Database and User**
```sql
-- Connect as postgres superuser
sudo -u postgres psql

-- Create dedicated database
CREATE DATABASE deployment_portal 
    WITH ENCODING 'UTF8' 
    LC_COLLATE='en_US.UTF-8' 
    LC_CTYPE='en_US.UTF-8' 
    TEMPLATE=template0;

-- Create application user
CREATE USER deployment_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';

-- Grant database privileges
GRANT ALL PRIVILEGES ON DATABASE deployment_portal TO deployment_user;

-- Connect to the new database
\c deployment_portal

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO deployment_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO deployment_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO deployment_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO deployment_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO deployment_user;

-- Create backup user (read-only)
CREATE USER backup_user WITH ENCRYPTED PASSWORD 'backup_password_here';
GRANT CONNECT ON DATABASE deployment_portal TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO backup_user;

-- Verify users
\du

-- Exit
\q
```

### **Configuration Files**

#### **postgresql.conf**
```bash
# Location varies by distribution
# Ubuntu/Debian: /etc/postgresql/15/main/postgresql.conf
# RHEL/CentOS: /var/lib/pgsql/15/data/postgresql.conf

sudo nano /etc/postgresql/15/main/postgresql.conf
```

**Key settings:**
```ini
# Connection Settings
listen_addresses = '*'                 # Allow connections from any IP
port = 5432                           # Default PostgreSQL port
max_connections = 200                 # Adjust based on expected load

# Memory Settings
shared_buffers = 256MB                # 25% of total RAM for small systems
effective_cache_size = 1GB            # 75% of total RAM
work_mem = 4MB                        # Per connection work memory
maintenance_work_mem = 64MB           # For maintenance operations

# Write-Ahead Logging (WAL)
wal_buffers = 16MB
checkpoint_segments = 32              # For PostgreSQL < 9.5
min_wal_size = 1GB                    # For PostgreSQL >= 9.5
max_wal_size = 4GB                    # For PostgreSQL >= 9.5

# Query Planner
random_page_cost = 1.1                # For SSD storage
effective_io_concurrency = 200        # For SSD storage

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 10MB
log_min_duration_statement = 1000     # Log slow queries (>1 second)
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on

# Performance
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min

# Security
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

#### **pg_hba.conf**
```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

**Configuration:**
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             postgres                                peer
local   all             all                                     peer

# IPv4 local connections
host    all             all             127.0.0.1/32            md5

# Application connections
host    deployment_portal  deployment_user    10.0.0.0/8          md5
host    deployment_portal  deployment_user    172.16.0.0/12       md5
host    deployment_portal  deployment_user    192.168.0.0/16      md5

# Backup connections
host    deployment_portal  backup_user       10.0.0.0/8          md5

# SSL connections (recommended for production)
hostssl deployment_portal  deployment_user    0.0.0.0/0           md5
hostssl deployment_portal  backup_user       0.0.0.0/0           md5

# Deny all other connections
host    all             all             0.0.0.0/0               reject
```

### **Restart and Verify**
```bash
# Restart PostgreSQL to apply changes
sudo systemctl restart postgresql

# Verify configuration
sudo -u postgres psql -c "SHOW config_file;"
sudo -u postgres psql -c "SELECT name, setting FROM pg_settings WHERE name LIKE '%shared_buffers%';"

# Test connection
psql -h localhost -U deployment_user -d deployment_portal -c "SELECT version();"
```

---

## 🐬 **MySQL Setup (Alternative)**

### **Installation**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server mysql-client

# RHEL/CentOS
sudo dnf install mysql-server mysql

# Start and enable MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Secure installation
sudo mysql_secure_installation
```

### **Database and User Creation**
```sql
-- Connect as root
sudo mysql -u root -p

-- Create database
CREATE DATABASE deployment_portal 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER 'deployment_user'@'%' IDENTIFIED BY 'your_secure_password_here';
CREATE USER 'deployment_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON deployment_portal.* TO 'deployment_user'@'%';
GRANT ALL PRIVILEGES ON deployment_portal.* TO 'deployment_user'@'localhost';

-- Create backup user
CREATE USER 'backup_user'@'%' IDENTIFIED BY 'backup_password_here';
GRANT SELECT ON deployment_portal.* TO 'backup_user'@'%';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SELECT User, Host FROM mysql.user WHERE User IN ('deployment_user', 'backup_user');

-- Exit
EXIT;
```

### **MySQL Configuration**
```bash
# Edit MySQL configuration
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

**Key settings:**
```ini
[mysqld]
# Basic Settings
bind-address = 0.0.0.0
port = 3306
max_connections = 200

# Buffer Settings
innodb_buffer_pool_size = 512M      # 70-80% of available RAM
innodb_log_file_size = 128M
innodb_flush_log_at_trx_commit = 2

# Character Set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Logging
log_error = /var/log/mysql/error.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Security
ssl-ca = ca.pem
ssl-cert = server-cert.pem
ssl-key = server-key.pem
```

---

## 🏗️ **Schema Creation**

### **Automatic Schema Creation**
The application uses Hibernate with `ddl-auto=update`, so tables will be created automatically on first startup.

**Application configuration:**
```properties
# In application.properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### **Manual Schema Creation (Optional)**
If you prefer manual control:

```sql
-- Connect to the database
psql -h localhost -U deployment_user -d deployment_portal

-- Create tables manually
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'admin', 'developer'))
);

CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE releases (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE deployment (
    id BIGSERIAL PRIMARY KEY,
    serial_number VARCHAR(20) NOT NULL UNIQUE,
    csi_id VARCHAR(50),
    service VARCHAR(255) NOT NULL,
    request_id VARCHAR(255),
    upcoming_branch VARCHAR(255),
    release_branch VARCHAR(255),
    release VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'Open',
    created_by VARCHAR(50) NOT NULL,
    team VARCHAR(50),
    date_requested TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_config BOOLEAN DEFAULT FALSE,
    config_request_id VARCHAR(255),
    upcoming_config_branch VARCHAR(255),
    rlm_id_uat1 VARCHAR(50),
    rlm_id_uat2 VARCHAR(50),
    rlm_id_uat3 VARCHAR(50),
    rlm_id_perf1 VARCHAR(50),
    rlm_id_perf2 VARCHAR(50),
    rlm_id_prod1 VARCHAR(50),
    rlm_id_prod2 VARCHAR(50),
    production_ready BOOLEAN DEFAULT FALSE,
    performance_ready BOOLEAN DEFAULT FALSE
);

CREATE TABLE deployment_environments (
    deployment_id BIGINT NOT NULL,
    environments VARCHAR(10) NOT NULL,
    FOREIGN KEY (deployment_id) REFERENCES deployment(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_deployment_status ON deployment(status);
CREATE INDEX idx_deployment_created_by ON deployment(created_by);
CREATE INDEX idx_deployment_date_requested ON deployment(date_requested);
CREATE INDEX idx_deployment_serial_number ON deployment(serial_number);
CREATE INDEX idx_deployment_environments_deployment_id ON deployment_environments(deployment_id);
```

### **Verify Schema**
```sql
-- PostgreSQL
\dt     # List tables
\d deployment    # Describe deployment table

-- MySQL
SHOW TABLES;
DESCRIBE deployment;
```

---

## ⚡ **Performance Tuning**

### **PostgreSQL Optimization**

#### **Memory Tuning**
```sql
-- Check current settings
SELECT name, setting, unit FROM pg_settings 
WHERE name IN ('shared_buffers', 'effective_cache_size', 'work_mem');

-- For 8GB RAM server:
-- shared_buffers = 2GB
-- effective_cache_size = 6GB
-- work_mem = 8MB
-- maintenance_work_mem = 256MB
```

#### **Connection Pooling**
```bash
# Install pgbouncer
sudo apt install pgbouncer

# Configure pgbouncer
sudo nano /etc/pgbouncer/pgbouncer.ini
```

```ini
[databases]
deployment_portal = host=localhost port=5432 dbname=deployment_portal

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 200
default_pool_size = 25
```

#### **Index Optimization**
```sql
-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Create additional indexes if needed
CREATE INDEX CONCURRENTLY idx_deployment_team_status 
ON deployment(team, status);

CREATE INDEX CONCURRENTLY idx_deployment_date_range 
ON deployment(date_requested) 
WHERE date_requested >= CURRENT_DATE - INTERVAL '30 days';
```

### **MySQL Optimization**

#### **InnoDB Tuning**
```sql
-- Check current settings
SHOW VARIABLES LIKE 'innodb%';

-- Optimize for deployment portal
SET GLOBAL innodb_buffer_pool_size = 512*1024*1024;  -- 512MB
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
SET GLOBAL innodb_log_buffer_size = 16*1024*1024;    -- 16MB
```

#### **Query Optimization**
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Analyze slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

---

## 🔐 **Security Configuration**

### **Network Security**
```bash
# Configure firewall
sudo ufw allow from trusted-network-ip to any port 5432
sudo ufw deny 5432

# For specific application server access
sudo ufw allow from 10.0.1.100 to any port 5432
```

### **Authentication Security**

#### **PostgreSQL SSL Setup**
```bash
# Generate SSL certificates
sudo -u postgres openssl req -new -x509 -days 365 -nodes -text \
    -out /var/lib/postgresql/15/main/server.crt \
    -keyout /var/lib/postgresql/15/main/server.key \
    -subj "/CN=your-db-server.com"

# Set permissions
sudo -u postgres chmod 600 /var/lib/postgresql/15/main/server.key
sudo -u postgres chmod 644 /var/lib/postgresql/15/main/server.crt

# Update postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'

# Restart PostgreSQL
sudo systemctl restart postgresql
```

#### **Password Policies**
```sql
-- PostgreSQL: Enable password encryption
ALTER SYSTEM SET password_encryption = 'scram-sha-256';
SELECT pg_reload_conf();

-- Force password changes
ALTER USER deployment_user PASSWORD 'new_complex_password_123!';
ALTER USER backup_user PASSWORD 'new_backup_password_456!';
```

### **Access Control**
```sql
-- Revoke unnecessary privileges
REVOKE ALL ON SCHEMA information_schema FROM deployment_user;
REVOKE ALL ON SCHEMA pg_catalog FROM deployment_user;

-- Grant minimal required permissions
GRANT CONNECT ON DATABASE deployment_portal TO deployment_user;
GRANT USAGE ON SCHEMA public TO deployment_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO deployment_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO deployment_user;
```

---

## 💾 **Backup & Recovery**

### **Automated Backup Script**
```bash
# Create backup directory
sudo mkdir -p /backup/postgresql
sudo chown postgres:postgres /backup/postgresql

# Create backup script
sudo nano /usr/local/bin/backup-deployment-portal.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/postgresql"
DATABASE="deployment_portal"
USERNAME="backup_user"
HOSTNAME="localhost"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/deployment_portal_${TIMESTAMP}.sql"

# Create backup
export PGPASSWORD="backup_password_here"
pg_dump -h $HOSTNAME -U $USERNAME -d $DATABASE > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Log backup status
if [ $? -eq 0 ]; then
    echo "$(date): Backup successful - $BACKUP_FILE.gz" >> /var/log/db-backup.log
else
    echo "$(date): Backup failed" >> /var/log/db-backup.log
fi
```

```bash
# Make script executable
sudo chmod +x /usr/local/bin/backup-deployment-portal.sh

# Schedule daily backups
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-deployment-portal.sh
```

### **Point-in-Time Recovery Setup**
```bash
# Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/postgresql/wal_archive/%f'
max_wal_senders = 3

# Create WAL archive directory
sudo mkdir -p /backup/postgresql/wal_archive
sudo chown postgres:postgres /backup/postgresql/wal_archive

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### **Recovery Procedures**
```bash
# Full database restore
sudo -u postgres psql -c "DROP DATABASE deployment_portal;"
sudo -u postgres psql -c "CREATE DATABASE deployment_portal;"
sudo -u postgres psql -d deployment_portal -f /backup/postgresql/deployment_portal_backup.sql

# Point-in-time recovery
sudo systemctl stop postgresql
sudo -u postgres pg_resetwal /var/lib/postgresql/15/main/
# Follow PostgreSQL PITR documentation for complete procedure
```

---

## 📊 **Monitoring & Maintenance**

### **Database Monitoring**
```sql
-- Monitor active connections
SELECT COUNT(*) as active_connections FROM pg_stat_activity 
WHERE state = 'active';

-- Monitor database size
SELECT pg_size_pretty(pg_database_size('deployment_portal')) as db_size;

-- Monitor table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### **Automated Maintenance**
```bash
# Create maintenance script
sudo nano /usr/local/bin/db-maintenance.sh
```

```bash
#!/bin/bash
# Database maintenance script

export PGPASSWORD="deployment_user_password"

# Vacuum and analyze
psql -h localhost -U deployment_user -d deployment_portal -c "VACUUM ANALYZE;"

# Reindex
psql -h localhost -U deployment_user -d deployment_portal -c "REINDEX DATABASE deployment_portal;"

# Update statistics
psql -h localhost -U deployment_user -d deployment_portal -c "ANALYZE;"

echo "$(date): Database maintenance completed" >> /var/log/db-maintenance.log
```

```bash
# Schedule weekly maintenance
sudo crontab -e
# Add: 0 3 * * 0 /usr/local/bin/db-maintenance.sh
```

### **Log Analysis**
```bash
# Monitor PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Analyze connection patterns
grep "connection authorized" /var/log/postgresql/postgresql-*.log | tail -20

# Check for errors
grep "ERROR" /var/log/postgresql/postgresql-*.log | tail -10
```

---

## ☁️ **Cloud Database Setup**

### **AWS RDS PostgreSQL**
```bash
# Create RDS instance using AWS CLI
aws rds create-db-instance \
    --db-instance-identifier deployment-portal-db \
    --db-instance-class db.t3.medium \
    --engine postgres \
    --engine-version 15.4 \
    --master-username postgres \
    --master-user-password SecurePassword123! \
    --allocated-storage 100 \
    --storage-type gp2 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-subnet-group-name default \
    --backup-retention-period 7 \
    --storage-encrypted
```

**Connection configuration:**
```properties
# application.properties for RDS
spring.datasource.url=jdbc:postgresql://deployment-portal-db.xxxxxx.us-east-1.rds.amazonaws.com:5432/deployment_portal
spring.datasource.username=deployment_user
spring.datasource.password=${DB_PASSWORD}
```

### **Google Cloud SQL**
```bash
# Create Cloud SQL instance
gcloud sql instances create deployment-portal-db \
    --database-version=POSTGRES_15 \
    --tier=db-custom-2-4096 \
    --region=us-central1 \
    --storage-type=SSD \
    --storage-size=100GB \
    --backup-start-time=02:00
```

### **Azure Database for PostgreSQL**
```bash
# Create Azure PostgreSQL
az postgres server create \
    --resource-group myResourceGroup \
    --name deployment-portal-db \
    --location westus2 \
    --admin-user postgres \
    --admin-password SecurePassword123! \
    --sku-name GP_Gen5_2 \
    --version 15
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Connection Issues**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if port is listening
sudo netstat -tlnp | grep 5432

# Test connection
telnet localhost 5432
```

#### **Permission Issues**
```sql
-- Check user permissions
\du

-- Grant missing permissions
GRANT ALL PRIVILEGES ON DATABASE deployment_portal TO deployment_user;
```

#### **Performance Issues**
```sql
-- Check active queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Kill long-running queries
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '10 minutes';
```

### **Log Analysis**
```bash
# Find configuration file location
sudo -u postgres psql -c "SHOW config_file;"

# Check log settings
sudo -u postgres psql -c "SHOW log_directory;"
sudo -u postgres psql -c "SHOW log_filename;"

# Monitor logs in real-time
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

*This comprehensive database setup guide covers all aspects of database configuration for the Deployment Portal. Follow the sections relevant to your deployment scenario and infrastructure requirements.*
