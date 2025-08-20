# Database Schema for Deployment Portal

## Overview
This document provides the complete database schema for the Deployment Portal application. The system uses PostgreSQL in production (recommended) and H2 for development. The schema consists of 4 main tables and 1 collection table.

## Database Configuration

### Recommended Database
- **Production**: PostgreSQL 15+
- **Development**: H2 (embedded)

### Connection Details Template
```properties
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/deployment_portal
spring.datasource.username=deployment_user
spring.datasource.password=your_secure_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

---

## Table Schemas

### 1. users
**Purpose**: Stores user accounts with role-based access control

```sql
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('developer', 'admin', 'superadmin'))
);

-- Indexes
CREATE INDEX idx_users_role ON users(role);

-- Sample Data
INSERT INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('developer1', 'dev123', 'developer'),
('superadmin', 'super123', 'superadmin');
```

**Field Descriptions**:
- `username`: Unique identifier for user login (Primary Key)
- `password`: User password (should be encrypted in production)
- `role`: User permission level (developer/admin/superadmin)

**Business Rules**:
- `developer`: Can create deployment requests, mark production ready
- `admin`: Can manage deployments, create releases, approve deployments
- `superadmin`: Full system access, can manage users

---

### 2. services
**Purpose**: Catalog of deployable services

```sql
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Indexes
CREATE INDEX idx_services_name ON services(name);

-- Sample Data (180 services following aaa-bbb-ccc format)
INSERT INTO services (name) VALUES 
('auth-login-service'),
('auth-logout-service'),
('pay-gateway-service'),
('user-profile-service'),
('notif-email-service'),
-- ... (see data.sql for complete list)
```

**Field Descriptions**:
- `id`: Auto-generated unique identifier (Primary Key)
- `name`: Service name following aaa-bbb-ccc naming convention

**Business Rules**:
- Service names must be unique
- Follow naming convention: category-function-service
- Used as reference data for deployment requests

---

### 3. releases
**Purpose**: Release management with YYYY-MM format

```sql
CREATE TABLE releases (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(7) NOT NULL UNIQUE CHECK (name ~ '^[0-9]{4}-[0-9]{2}$'),
    description TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_releases_name ON releases(name);

-- Sample Data
INSERT INTO releases (name, description) VALUES 
('2025-01', 'January 2025 Release - New authentication features'),
('2025-02', 'February 2025 Release - Payment system enhancements'),
('2025-03', 'March 2025 Release - User experience improvements');
```

**Field Descriptions**:
- `id`: Auto-generated unique identifier (Primary Key)
- `name`: Release name in YYYY-MM format (must be unique)
- `description`: Descriptive text about the release purpose

**Business Rules**:
- Only admin and superadmin can create releases
- Name must follow YYYY-MM format (e.g., 2025-01)
- Used to organize deployment requests by release cycle

---

### 4. deployment
**Purpose**: Core deployment request tracking

```sql
CREATE TABLE deployment (
    id BIGSERIAL PRIMARY KEY,
    serial_number VARCHAR(20) UNIQUE,
    csi_id VARCHAR(50),
    service VARCHAR(100) NOT NULL,
    request_id VARCHAR(100),
    upcoming_branch VARCHAR(200),
    is_config BOOLEAN DEFAULT FALSE,
    config_request_id VARCHAR(100),
    upcoming_config_branch VARCHAR(200),
    release_branch VARCHAR(200),
    team VARCHAR(100),
    date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    release VARCHAR(7),
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Pending', 'Completed')),
    created_by VARCHAR(50),
    rlm_id_uat1 VARCHAR(50),
    rlm_id_uat2 VARCHAR(50),
    rlm_id_uat3 VARCHAR(50),
    rlm_id_perf1 VARCHAR(50),
    rlm_id_perf2 VARCHAR(50),
    rlm_id_prod1 VARCHAR(50),
    rlm_id_prod2 VARCHAR(50),
    production_ready BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_deployment_service ON deployment(service);
CREATE INDEX idx_deployment_status ON deployment(status);
CREATE INDEX idx_deployment_release ON deployment(release);
CREATE INDEX idx_deployment_created_by ON deployment(created_by);
CREATE INDEX idx_deployment_team ON deployment(team);
CREATE INDEX idx_deployment_date_requested ON deployment(date_requested);

-- Foreign Key Constraints
ALTER TABLE deployment ADD CONSTRAINT fk_deployment_created_by 
    FOREIGN KEY (created_by) REFERENCES users(username);
```

**Field Descriptions**:
- `id`: Auto-generated unique identifier (Primary Key)
- `serial_number`: Unique tracking number (format: MSDR0000001)
- `csi_id`: Customer Service Identifier for business tracking
- `service`: Name of service being deployed
- `request_id`: Business request identifier (e.g., jenkins-REQ001)
- `upcoming_branch`: Alternative branch identifier
- `is_config`: Flag for configuration vs application deployment
- `config_request_id`: Config-specific request ID
- `upcoming_config_branch`: Config branch identifier
- `release_branch`: Git release branch name
- `team`: Development team responsible
- `date_requested`: Request creation timestamp
- `date_modified`: Last modification timestamp
- `release`: Associated release (YYYY-MM format)
- `status`: Current deployment status
- `created_by`: Username who created the request
- `rlm_id_*`: RLM IDs for different environments
- `production_ready`: Final approval flag

---

### 5. deployment_environments
**Purpose**: Many-to-many relationship for deployment environments

```sql
CREATE TABLE deployment_environments (
    deployment_id BIGINT NOT NULL,
    environments VARCHAR(10) NOT NULL CHECK (environments IN ('UAT1', 'UAT2', 'UAT3', 'PERF1', 'PERF2', 'PROD1', 'PROD2'))
);

-- Indexes
CREATE INDEX idx_deployment_environments_deployment_id ON deployment_environments(deployment_id);
CREATE INDEX idx_deployment_environments_environments ON deployment_environments(environments);

-- Foreign Key Constraints
ALTER TABLE deployment_environments ADD CONSTRAINT fk_deployment_environments_deployment_id 
    FOREIGN KEY (deployment_id) REFERENCES deployment(id) ON DELETE CASCADE;
```

**Field Descriptions**:
- `deployment_id`: Reference to deployment table
- `environments`: Environment name (UAT1, UAT2, UAT3, PERF1, PERF2, PROD1, PROD2)

---

## Database Setup Instructions

### Step 1: Create Database and User
```sql
-- As PostgreSQL superuser
CREATE DATABASE deployment_portal;
CREATE USER deployment_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE deployment_portal TO deployment_user;

-- Connect to deployment_portal database
\c deployment_portal;
GRANT ALL ON SCHEMA public TO deployment_user;
```

### Step 2: Run Schema Creation
Execute the table creation scripts above in order:
1. users
2. services  
3. releases
4. deployment
5. deployment_environments

### Step 3: Load Initial Data
```sql
-- Load users (update passwords as needed)
INSERT INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('developer1', 'dev123', 'developer'),
('superadmin', 'super123', 'superadmin');

-- Load services (see complete list in data.sql)
-- Load initial releases
-- Add any initial deployment data
```

### Step 4: Application Configuration
Update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://your-host:5432/deployment_portal
spring.datasource.username=deployment_user
spring.datasource.password=your_secure_password
spring.jpa.hibernate.ddl-auto=validate
```

---

## Security Considerations

### Production Recommendations
1. **Password Encryption**: Implement BCrypt for password hashing
2. **SSL/TLS**: Enable encrypted connections
3. **Connection Pooling**: Configure HikariCP
4. **Backup Strategy**: Regular automated backups
5. **Monitoring**: Set up database performance monitoring

### Access Control
```sql
-- Grant minimal required permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO deployment_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO deployment_user;
```

---

## Migration from H2 to PostgreSQL

If migrating from H2 development database:

1. **Export H2 Data**:
   ```sql
   SELECT * FROM users;
   SELECT * FROM services;
   SELECT * FROM releases;
   SELECT * FROM deployment;
   SELECT * FROM deployment_environments;
   ```

2. **Import to PostgreSQL**:
   - Create tables using schemas above
   - Import data using COPY commands or INSERT statements
   - Verify data integrity and constraints

3. **Update Application Configuration**:
   - Change datasource URL to PostgreSQL
   - Update hibernate dialect
   - Set ddl-auto to validate

---

## Maintenance

### Regular Tasks
1. **Index Maintenance**: Monitor and rebuild indexes as needed
2. **Statistics Update**: Keep table statistics current
3. **Cleanup**: Archive old deployment records periodically
4. **Backup Verification**: Test backup restore procedures

### Performance Tuning
- Monitor slow queries
- Add indexes for frequent filter combinations
- Consider partitioning for large deployment tables
- Optimize connection pool settings

---

## Support

For database-related issues:
1. Check application logs for SQL errors
2. Monitor database performance metrics
3. Verify connection pool health
4. Review query execution plans for optimization

This schema supports the full functionality of the Deployment Portal including role-based access, deployment tracking, environment management, and audit trails.
