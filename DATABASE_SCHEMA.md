# Deployment Portal - Database Schema Documentation

## Table of Contents
1. [Database Overview](#database-overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Table Structures](#table-structures)
4. [Relationships](#relationships)
5. [Indexes & Performance](#indexes--performance)
6. [Sample Data](#sample-data)
7. [Migration Scripts](#migration-scripts)

---

## Database Overview

### Database Technology
- **Type:** Embedded H2 Database
- **Mode:** In-memory with persistent storage
- **File Location:** `./testdb` (in application root)
- **Dialect:** H2 SQL
- **ORM:** JPA with Hibernate
- **Schema Management:** Auto-create with data.sql initialization

### Key Characteristics
- **Development Friendly:** Fast startup, no external dependencies
- **Auto-initialization:** Schema created on startup
- **Sample Data:** Pre-loaded with comprehensive test data
- **Reset Capability:** Database recreated on each restart

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │   Deployment    │       │    Service      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ username        │       │ serial_number   │       │ name            │
│ password        │       │ csi_id          │       └─────────────────┘
│ role            │       │ service         │
└─────────────────┘       │ request_id      │
                          │ release_branch  │       ┌─────────────────┐
┌─────────────────┐       │ release         │       │    Release      │
│ Deployment_     │   ┌──▶│ team            │       ├─────────────────┤
│ Environments    │   │   │ status          │       │ id (PK)         │
├─────────────────┤   │   │ created_by      │       │ name            │
│ deployment_id   │───┘   │ is_config       │       │ description     │
│ (FK)            │       │ config_req_id   │       └─────────────────┘
│ environments    │       │ rlm_id_uat1     │
└─────────────────┘       │ rlm_id_uat2     │
                          │ rlm_id_uat3     │
                          │ rlm_id_perf1    │
                          │ rlm_id_perf2    │
                          │ rlm_id_prod1    │
                          │ rlm_id_prod2    │
                          │ production_ready│
                          │ date_requested  │
                          │ date_modified   │
                          └─────────────────┘
```

**Relationship Notes:**
- **User** → **Deployment**: Users create deployments (created_by field)
- **Deployment** → **Deployment_Environments**: One-to-many for environment assignments
- **Service**: Reference table for available services (no direct FK)
- **Release**: Reference table for available releases (no direct FK)
- **Deployment.service**: String field referencing service names
- **Deployment.release**: String field referencing release names in YYYY-MM format
│ environments    │       │ rlm_id_uat1     │       │ modified_date   │
└─────────────────┘       │ rlm_id_uat2     │       └─────────────────┘
                          │ rlm_id_uat3     │
                          │ rlm_id_perf1    │
                          │ rlm_id_perf2    │
                          │ rlm_id_prod1    │
                          │ rlm_id_prod2    │
                          │ production_ready│
                          │ requester       │
                          │ requested_date  │
                          │ date_modified   │
                          └─────────────────┘
```

---

## Table Structures

### User Table
Stores user authentication and role information.

```sql
CREATE TABLE User (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Primary key, auto-incrementing
- `username` - Unique username for login
- `password` - Encoded password (plain text in development)
- `role` - User role: 'superadmin', 'admin', 'developer'
- `created_date` - Account creation timestamp
- `modified_date` - Last modification timestamp

**Constraints:**
- Primary Key: `id`
- Unique: `username`
- Not Null: `username`, `password`, `role`

### Service Table
Catalog of available services for deployment.

```sql
CREATE TABLE Service (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);
```

**Columns:**
- `id` - Primary key, auto-incrementing
- `name` - Service name in aaa-bbb-ccc format
- `description` - Optional service description

**Constraints:**
- Primary Key: `id`
- Unique: `name`
- Not Null: `name`

### Release Table
Available release branches for deployments.

```sql
CREATE TABLE Release (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL
);
```

**Columns:**
- `id` - Primary key, auto-incrementing
- `name` - Release name in YYYY-MM format (e.g., 2025-01, 2025-12)
- `description` - Release description

**Constraints:**
- Primary Key: `id`
- Unique: `name`
- Not Null: `name`, `description`

**Validation Rules:**
- Name format must be YYYY-MM (enforced at application level)
- Year must be between 2024-2030 (enforced at application level)
- Month must be 01-12 (enforced at application level)
- Description cannot be empty

### Deployment Table
Main entity storing deployment requests.

```sql
CREATE TABLE Deployment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    serial_number VARCHAR(20) NOT NULL UNIQUE,
    csi_id VARCHAR(20) NOT NULL,
    service VARCHAR(100) NOT NULL,
    request_id VARCHAR(50) NOT NULL,
    release_branch VARCHAR(50),
    release VARCHAR(50) NOT NULL,
    team VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open',
    created_by VARCHAR(50) NOT NULL,
    is_config BOOLEAN DEFAULT FALSE,
    config_request_id VARCHAR(50),
    rlm_id_uat1 VARCHAR(50),
    rlm_id_uat2 VARCHAR(50),
    rlm_id_uat3 VARCHAR(50),
    rlm_id_perf1 VARCHAR(50),
    rlm_id_perf2 VARCHAR(50),
    rlm_id_prod1 VARCHAR(50),
    rlm_id_prod2 VARCHAR(50),
    production_ready BOOLEAN DEFAULT FALSE,
    date_requested TIMESTAMP NOT NULL,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deployment_environments (
    deployment_id BIGINT NOT NULL,
    environments VARCHAR(20) NOT NULL,
    FOREIGN KEY (deployment_id) REFERENCES Deployment(id)
);
```

**Deployment Table Columns:**
- `id` - Primary key, auto-incrementing
- `serial_number` - Unique MSDR number (format: MSDR0000001)
- `csi_id` - Customer Service Identifier (172033, 172223, 169608)
- `service` - Service name (direct string, not foreign key)
- `request_id` - Business request identifier (e.g., jenkins-REQ001)
- `release_branch` - Git release branch name
- `release` - Release name in YYYY-MM format (e.g., 2025-01, 2025-12)
- `team` - Development team name
- `status` - Current status: 'Open', 'In Progress', 'Pending', 'Completed'
- `created_by` - Username of the person who created the request
- `is_config` - Boolean flag for configuration requests
- `config_request_id` - Configuration request identifier
- `rlm_id_uat1/2/3` - RLM IDs for UAT environments
- `rlm_id_perf1/2` - RLM IDs for Performance environments
- `rlm_id_prod1/2` - RLM IDs for Production environments
- `production_ready` - Boolean flag for production readiness
- `date_requested` - Request creation timestamp
- `date_modified` - Last modification timestamp

**Deployment Environments Table:**
- `deployment_id` - Foreign key to Deployment table
- `environments` - Environment names (UAT1, UAT2, UAT3, PERF, PROD)

**Constraints:**
- Primary Key: `id`
- Unique: `serial_number`
- Not Null: `serial_number`, `csi_id`, `service`, `request_id`, `release`, `team`, `created_by`, `date_requested`

**Business Rules:**
- Only original requester (created_by) or superadmin can mark production_ready
- Production ready can only be set when status is 'Completed'
- Serial numbers are auto-generated in MSDR format
- Release names must follow YYYY-MM format
- Default Values: `status` = 'Open', `config_request` = FALSE, `production_ready` = FALSE

### Deployment_Environments Table
Junction table for deployment-environment relationships.

```sql
CREATE TABLE Deployment_Environments (
    deployment_id BIGINT NOT NULL,
    environments VARCHAR(10) NOT NULL,
    
    FOREIGN KEY (deployment_id) REFERENCES Deployment(id)
);
```

**Columns:**
- `deployment_id` - Foreign key to Deployment table
- `environments` - Environment name (DEV1, DEV2, DEV3, UAT1, UAT2, UAT3, PERF1, PERF2, PROD1, PROD2)

**Constraints:**
- Foreign Key: `deployment_id` → Deployment(id)
- Not Null: `deployment_id`, `environments`

---

## Relationships

### One-to-Many Relationships

**Service → Deployment**
- One Service can have many Deployments
- Each Deployment belongs to exactly one Service
- Foreign Key: `Deployment.service_id` → `Service.id`

**Release → Deployment**
- One Release can have many Deployments
- Each Deployment belongs to exactly one Release
- Foreign Key: `Deployment.release_id` → `Release.id`

### One-to-Many Collection Relationships

**Deployment → Environments**
- One Deployment can target multiple Environments
- Stored as @ElementCollection in JPA
- Junction Table: `Deployment_Environments`

### Business Relationships

**User ← Deployment (Requester)**
- Deployments track the requesting user via username
- Not enforced as a foreign key (business relationship)
- Used for authorization and audit trail

---

## Indexes & Performance

### Primary Indexes (Automatic)
- `User.id` - Primary key index
- `Service.id` - Primary key index
- `Release.id` - Primary key index
- `Deployment.id` - Primary key index

### Unique Indexes (Automatic)
- `User.username` - Unique constraint index
- `Service.name` - Unique constraint index
- `Release.name` - Unique constraint index
- `Deployment.serial_number` - Unique constraint index

### Recommended Additional Indexes
```sql
-- For filtering and searching
CREATE INDEX idx_deployment_status ON Deployment(status);
CREATE INDEX idx_deployment_team ON Deployment(team);
CREATE INDEX idx_deployment_requester ON Deployment(requester);
CREATE INDEX idx_deployment_requested_date ON Deployment(requested_date);
CREATE INDEX idx_deployment_csi_id ON Deployment(csi_id);

-- For environment filtering
CREATE INDEX idx_deployment_environments ON Deployment_Environments(environments);

-- Composite indexes for common queries
CREATE INDEX idx_deployment_status_team ON Deployment(status, team);
CREATE INDEX idx_deployment_requester_status ON Deployment(requester, status);
```

### Performance Considerations
- **Small Dataset:** Current H2 setup handles hundreds of records efficiently
- **Query Optimization:** Most queries use indexed columns
- **Pagination:** Implement for large datasets in production
- **Caching:** Consider adding Spring Cache for reference data

---

## Sample Data

### Users (6 records)
```sql
-- Superadmin
('superadmin', 'admin123', 'superadmin')

-- Admins (2)
('admin1', 'admin123', 'admin')
('admin2', 'admin123', 'admin')

-- Developers (3)
('dev1', 'dev123', 'developer')
('dev2', 'dev123', 'developer')
('dev3', 'dev123', 'developer')
```

### Services (180 records)
Services follow the pattern `aaa-bbb-ccc` where:
- aaa: 3-letter prefix (api, web, data, ml, etc.)
- bbb: 3-letter middle (ser, app, mgr, svc, etc.)
- ccc: 3-letter suffix (svc, srv, api, mgr, etc.)

**Examples:**
- `api-auth-svc` - Authentication service
- `web-portal-app` - Web portal application
- `data-pipeline-svc` - Data pipeline service
- `ml-inference-api` - Machine learning inference API

### Releases (18 records)
Release information following YYYY-MM format:
- **Format:** YYYY-MM (e.g., 2025-01, 2025-12, 2026-01)
- **Range:** From 2025-01 through 2026-06 
- **Descriptions:** Meaningful release descriptions
- **Examples:**
  - `2025-01` - "Initial release for January 2025"
  - `2025-06` - "June 2025 mid-year release"
  - `2025-12` - "December 2025 year-end release"
  - `2026-01` - "January 2026 major release"

### Deployments (30+ records)
Comprehensive deployment requests with:
- **Serial Numbers:** MSDR0000001 through MSDR0000030+
- **CSI IDs:** Randomized among 172033, 172223, 169608
- **Teams:** Phoenix, Crusaders, Transformers, Avengers, CRUD, Hyper Care
- **Statuses:** Distributed across Open, In Progress, Pending, Completed
- **Environments:** Randomized combinations of DEV1-3, UAT1-3, PERF1-2, PROD1-2
- **RLM IDs:** Environment-specific tracking identifiers
- **Config Requests:** Mix of regular and configuration requests
- **Production Ready:** Some completed requests marked as production ready

### Environment Assignments
Each deployment is assigned to 1-4 environments randomly:
```sql
-- Example assignments
(1, 'DEV1'), (1, 'DEV2'), (1, 'UAT1')  -- Deployment 1: 3 environments
(2, 'DEV3'), (2, 'UAT2'), (2, 'PERF1'), (2, 'PROD1')  -- Deployment 2: 4 environments
(3, 'DEV1')  -- Deployment 3: 1 environment
```

---

## Migration Scripts

### Schema Creation (Automatic)
The application uses JPA auto-ddl to create tables on startup:

```properties
# application.properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.sql.init.mode=always
```

### Data Initialization
Sample data is loaded via `data.sql` script:

**Load Order:**
1. Users (authentication data)
2. Services (reference data)
3. Releases (reference data)
4. Deployments (main data)
5. Deployment_Environments (relationship data)

### Manual Schema Creation
For production environments, use explicit DDL:

```sql
-- Create all tables
CREATE TABLE User (...);
CREATE TABLE Service (...);
CREATE TABLE Release (...);
CREATE TABLE Deployment (...);
CREATE TABLE Deployment_Environments (...);

-- Add indexes
CREATE INDEX idx_deployment_status ON Deployment(status);
-- ... other indexes

-- Insert reference data
INSERT INTO Service (name, description) VALUES (...);
INSERT INTO Release (name, description) VALUES (...);
INSERT INTO User (username, password, role) VALUES (...);
```

### Backup & Restore
```bash
# Backup H2 database
cp ./testdb.mv.db ./backup/testdb_$(date +%Y%m%d).mv.db

# Restore H2 database
cp ./backup/testdb_20231201.mv.db ./testdb.mv.db
```

---

## Data Validation Rules

### Business Rules
1. **Serial Numbers:** Must be unique and follow MSDR0000XXX format
2. **CSI IDs:** Must be one of: 172033, 172223, 169608
3. **Status Progression:** Open → In Progress → Pending → Completed
4. **Production Ready:** Only available for Completed status
5. **RLM IDs:** Environment-specific, editable by admins only
6. **Config Requests:** Must have config_req_id when config_request = true

### Data Integrity
- **Referential Integrity:** Foreign key constraints enforced
- **Unique Constraints:** Prevent duplicate serial numbers, usernames, service names
- **Default Values:** Ensure proper initialization of status and boolean fields
- **Audit Trail:** All modifications update date_modified timestamp

### Validation in Application
- **Frontend Validation:** Angular form validators
- **Backend Validation:** JPA validation annotations
- **Business Logic:** Service layer validation rules
- **Database Constraints:** Schema-level enforcement

---

## Troubleshooting

### Common Issues

**Database Lock Errors:**
```
# Stop application cleanly
# Delete lock files
rm ./testdb.lock.db

# Restart application
mvn spring-boot:run
```

**Schema Mismatch:**
```
# Force schema recreation
# Set in application.properties
spring.jpa.hibernate.ddl-auto=create-drop

# Or delete database files
rm ./testdb.mv.db
```

**Data Loading Errors:**
```
# Check data.sql syntax
# Verify foreign key references
# Ensure proper date formats
```

### Performance Issues
- Monitor query execution times
- Add indexes for slow queries
- Consider pagination for large datasets
- Use database profiling tools

### Data Corruption
- Regular backups recommended
- Validate data integrity periodically
- Monitor constraint violations
- Implement data recovery procedures
