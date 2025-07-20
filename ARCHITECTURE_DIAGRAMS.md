# Deployment Portal - Architecture & Deployment Diagrams

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Component Interaction Flow](#component-interaction-flow)
3. [Deployment Architecture](#deployment-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Security Architecture](#security-architecture)
6. [Development vs Production](#development-vs-production)

---

## System Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT TIER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   Web Browser   │  │   Web Browser   │  │   Web Browser   │           │
│  │    (Chrome)     │  │   (Firefox)     │  │    (Safari)     │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│                                    │                                       │
│                              HTTP/HTTPS                                    │
│                                    │                                       │
├────────────────────────────────────┼───────────────────────────────────────┤
│                              PRESENTATION TIER                             │
├────────────────────────────────────┼───────────────────────────────────────┤
│  ┌─────────────────────────────────┼─────────────────────────────────────┐ │
│  │                     Angular Frontend (Port 4200)                     │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │ │
│  │ │ Components  │ │  Services   │ │   Guards    │ │   Interceptors  │  │ │
│  │ │ - Login     │ │ - Auth      │ │ - Auth      │ │ - HTTP Headers  │  │ │
│  │ │ - Dashboard │ │ - Deploy    │ │ - Role      │ │ - Error Handle  │  │ │
│  │ │ - Request   │ │ - Export    │ │             │ │                 │  │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘  │ │
│  └─────────────────────────────────┼─────────────────────────────────────┘ │
│                                    │                                       │
│                              REST API Calls                                │
│                                    │                                       │
├────────────────────────────────────┼───────────────────────────────────────┤
│                              APPLICATION TIER                              │
├────────────────────────────────────┼───────────────────────────────────────┤
│  ┌─────────────────────────────────┼─────────────────────────────────────┐ │
│  │                  Spring Boot Backend (Port 8080)                     │ │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │ │                        Web Layer                                │  │ │
│  │ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │  │ │
│  │ │ │Controllers  │ │Security     │ │CORS Config  │ │Error Handler│ │  │ │
│  │ │ │- Auth       │ │- Session    │ │- Origins    │ │- Global     │ │  │ │
│  │ │ │- Deployment │ │- Roles      │ │- Methods    │ │- API Resp   │ │  │ │
│  │ │ │- Export     │ │             │ │             │ │             │ │  │ │
│  │ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │  │ │
│  │ └─────────────────────────────────────────────────────────────────┘  │ │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │ │                      Service Layer                              │  │ │
│  │ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │  │ │
│  │ │ │Deployment   │ │  Auth       │ │   User      │ │   Export    │ │  │ │
│  │ │ │Service      │ │ Service     │ │  Service    │ │  Service    │ │  │ │
│  │ │ │- CRUD       │ │- Login      │ │- Validation │ │- CSV Gen    │ │  │ │
│  │ │ │- Filter     │ │- Session    │ │- Roles      │ │- Filter     │ │  │ │
│  │ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │  │ │
│  │ └─────────────────────────────────────────────────────────────────┘  │ │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │ │                       Data Layer                                │  │ │
│  │ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │  │ │
│  │ │ │JPA/Hibernate│ │Repositories │ │   Entities  │ │Transactions │ │  │ │
│  │ │ │- Query Gen  │ │- CRUD Ops   │ │- Deployment │ │- ACID       │ │  │ │
│  │ │ │- Relations  │ │- Custom Q   │ │- User       │ │- Rollback   │ │  │ │
│  │ │ │             │ │             │ │- Service    │ │             │ │  │ │
│  │ │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │  │ │
│  │ └─────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                       │
│                               JPA/SQL                                      │
│                                    │                                       │
├────────────────────────────────────┼───────────────────────────────────────┤
│                               DATA TIER                                    │
├────────────────────────────────────┼───────────────────────────────────────┤
│  ┌─────────────────────────────────┼─────────────────────────────────────┐ │
│  │                      H2 Database (Embedded)                          │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │ │
│  │ │Deployment   │ │    User     │ │   Service   │ │    Release      │  │ │
│  │ │   Table     │ │   Table     │ │   Table     │ │    Table        │  │ │
│  │ │- 30+ Records│ │- 6 Records  │ │- 180 Records│ │- 12 Records     │  │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘  │ │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │ │            Deployment_Environments Junction Table              │  │ │
│  │ │                       (Environment Mappings)                   │  │ │
│  │ └─────────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

### User Authentication Flow
```
┌─────────────┐    Login Request    ┌─────────────┐    Validate     ┌─────────────┐
│   Browser   │────────────────────▶│  Angular    │────────────────▶│   Auth      │
│             │                     │  Frontend   │                 │  Service    │
└─────────────┘                     └─────────────┘                 └─────────────┘
       │                                   │                               │
       │              Display Login Form   │                               │
       │◀──────────────────────────────────┤                               │
       │                                   │                               │
       │    Username/Password              │                               │
       ├──────────────────────────────────▶│                               │
       │                                   │         POST /api/auth/login  │
       │                                   ├──────────────────────────────▶│
       │                                   │                               │
       │                                   │◀─────────────────────────────┤
       │                                   │    Session Cookie + User Data │
       │    Redirect to Dashboard          │                               │
       │◀──────────────────────────────────┤                               │
```

### Deployment Request Management Flow
```
┌─────────────┐   Create Request   ┌─────────────┐   Save Request   ┌─────────────┐
│  Developer  │───────────────────▶│  Angular    │─────────────────▶│   Spring    │
│   (User)    │                    │  Frontend   │                  │   Boot      │
└─────────────┘                    └─────────────┘                  └─────────────┘
       │                                  │                                │
       │     Display New Request Form     │                                │
       │◀─────────────────────────────────┤                                │
       │                                  │                                │
       │   Fill Form & Submit             │                                │
       ├─────────────────────────────────▶│                                │
       │                                  │     POST /api/deployments     │
       │                                  ├───────────────────────────────▶│
       │                                  │                                │
       │                                  │                                ▼
       │                                  │                         ┌─────────────┐
       │                                  │                         │  Database   │
       │                                  │                         │   (H2)      │
       │                                  │                         └─────────────┘
       │                                  │                                │
       │                                  │◀───────────────────────────────┤
       │                                  │     Created Request Data       │
       │     Show Success Message         │                                │
       │◀─────────────────────────────────┤                                │
```

### Release Management Flow
```
┌─────────────┐   Create Release   ┌─────────────┐   Save Release   ┌─────────────┐
│    Admin    │───────────────────▶│  Angular    │─────────────────▶│   Spring    │
│  (User)     │                    │  Frontend   │                  │   Boot      │
└─────────────┘                    └─────────────┘                  └─────────────┘
       │                                  │                                │
       │   Display Create Release Dialog  │                                │
       │◀─────────────────────────────────┤                                │
       │                                  │                                │
       │   Enter Name (YYYY-MM) & Desc    │                                │
       ├─────────────────────────────────▶│                                │
       │                                  │     POST /api/releases        │
       │                                  ├───────────────────────────────▶│
       │                                  │                                │
       │                                  │                                ▼
       │                                  │                         ┌─────────────┐
       │                                  │     Validate Format     │  Database   │
       │                                  │     (YYYY-MM)           │   (H2)      │
       │                                  │                         └─────────────┘
       │                                  │                                │
       │                                  │◀───────────────────────────────┤
       │                                  │     Created Release Data       │
       │     Show Success/Error Message   │                                │
       │◀─────────────────────────────────┤                                │
```

### Filtering and Search Flow
```
┌─────────────┐   Apply Filters   ┌─────────────┐   Filter Request   ┌─────────────┐
│    User     │──────────────────▶│  Angular    │───────────────────▶│   Spring    │
│             │                   │  Frontend   │                    │   Boot      │
└─────────────┘                   └─────────────┘                    └─────────────┘
       │                                 │                                  │
       │                                 │    GET /api/deployments          │
       │                                 │    ?status=Open&team=Phoenix     │
       │                                 ├─────────────────────────────────▶│
       │                                 │                                  │
       │                                 │                                  ▼
       │                                 │                           ┌─────────────┐
       │                                 │                           │   Service   │
       │                                 │                           │   Layer     │
       │                                 │                           └─────────────┘
       │                                 │                                  │
       │                                 │                                  ▼
       │                                 │                           ┌─────────────┐
       │                                 │                           │  Repository │
       │                                 │                           │   (JPA)     │
       │                                 │                           └─────────────┘
       │                                 │                                  │
       │                                 │                                  ▼
       │                                 │                           ┌─────────────┐
       │                                 │                           │  Database   │
       │                                 │                           │    Query    │
       │                                 │                           └─────────────┘
       │                                 │                                  │
       │                                 │◀─────────────────────────────────┤
       │                                 │      Filtered Results             │
       │    Display Filtered Results     │                                  │
       │◀────────────────────────────────┤                                  │
```

---

## Deployment Architecture

### Development Environment
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Developer Workstation                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                    ┌─────────────────┐                │
│  │    Frontend     │                    │     Backend     │                │
│  │    (Angular)    │                    │  (Spring Boot)  │                │
│  │                 │                    │                 │                │
│  │  Port: 4200     │◀──────────────────▶│   Port: 8080    │                │
│  │  Dev Server     │    Proxy Config    │   Embedded      │                │
│  │  Hot Reload     │                    │   Tomcat        │                │
│  └─────────────────┘                    └─────────────────┘                │
│                                                   │                         │
│                                                   ▼                         │
│                                         ┌─────────────────┐                │
│                                         │   H2 Database   │                │
│                                         │                 │                │
│                                         │  File: testdb   │                │
│                                         │  Mode: Local    │                │
│                                         │  Web Console    │                │
│                                         └─────────────────┘                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Development Tools:                                                         │
│  • Visual Studio Code                                                      │
│  • Chrome DevTools                                                         │
│  • Angular CLI                                                             │
│  • Maven                                                                   │
│  • Git                                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Production Environment (Conceptual)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Load Balancer                                  │
│                          (Nginx/Apache)                                    │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Web Server Tier                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │   Web Server    │  │   Web Server    │  │   Web Server    │            │
│  │    Instance     │  │    Instance     │  │    Instance     │            │
│  │                 │  │                 │  │                 │            │
│  │  Static Assets  │  │  Static Assets  │  │  Static Assets  │            │
│  │  Angular Build  │  │  Angular Build  │  │  Angular Build  │            │
│  │   Port: 80/443  │  │   Port: 80/443  │  │   Port: 80/443  │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Application Server Tier                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  Spring Boot    │  │  Spring Boot    │  │  Spring Boot    │            │
│  │   Instance      │  │   Instance      │  │   Instance      │            │
│  │                 │  │                 │  │                 │            │
│  │  REST API       │  │  REST API       │  │  REST API       │            │
│  │  Business Logic │  │  Business Logic │  │  Business Logic │            │
│  │   Port: 8080    │  │   Port: 8080    │  │   Port: 8080    │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Database Tier                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                    ┌─────────────────┐                │
│  │   Primary DB    │                    │   Backup DB     │                │
│  │   (PostgreSQL   │◀──────────────────▶│   (PostgreSQL   │                │
│  │   or MySQL)     │    Replication     │   or MySQL)     │                │
│  │                 │                    │                 │                │
│  │  Production     │                    │  Standby        │                │
│  │  Data Store     │                    │  Data Store     │                │
│  └─────────────────┘                    └─────────────────┘                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Request Creation Data Flow
```
[Developer] ──┐
              │ 1. Fill Form
              ▼
       [New Request Dialog]
              │ 2. Validate Form
              ▼
       [Deployment Service]
              │ 3. HTTP POST
              ▼
    [DeploymentController]
              │ 4. Business Validation
              ▼
   [DeploymentRepository]
              │ 5. Create Entity
              ▼
      [Database]
```

### Export Data Flow with Date Range
```
[User] ──┐
         │ 1. Select Date Range & Filters
         ▼
   [Bottom Toolbar]
         │ 2. Prepare Export Parameters
         ▼
   [Deployment Service]
         │ 3. HTTP GET /api/reports/general
         │    ?startDate=2024-01-01&endDate=2024-12-31
         ▼
   [DeploymentController]
         │ 4. Parse Date Parameters
         ▼
   [DeploymentRepository]
         │ 5. Query with Date Filter
         │    WHERE date_requested BETWEEN start AND end
         ▼
      [Database]
         │ 6. Return Filtered Records
         ▼
   [DeploymentController]
         │ 7. Generate CSV Content
         ▼
   [HTTP Response]
         │ 8. Stream CSV File
         ▼
   [Browser Download]
```
              ▼
     [DeploymentService]
              │ 5. Create Entity
              ▼
   [DeploymentRepository]
              │ 6. JPA Save
              ▼
       [H2 Database]
              │ 7. Insert Record
              ▼
    [deployment Table]
              │ 8. Return Saved Entity
              ▼
   [DeploymentRepository]
              │ 9. Return to Service
              ▼
     [DeploymentService]
              │ 10. Return to Controller
              ▼
    [DeploymentController]
              │ 11. HTTP Response
              ▼
       [Deployment Service]
              │ 12. Update UI
              ▼
       [Request List Component]
              │ 13. Display New Request
              ▼
         [Developer]
```

### Authentication Data Flow
```
[User] ──┐
         │ 1. Enter Credentials
         ▼
   [Login Component]
         │ 2. HTTP POST
         ▼
    [Auth Service]
         │ 3. Call Backend
         ▼
   [AuthController]
         │ 4. Validate Credentials
         ▼
   [UserRepository]
         │ 5. Query Database
         ▼
    [User Table]
         │ 6. Return User Record
         ▼
   [UserRepository]
         │ 7. Create Session
         ▼
   [HttpSession]
         │ 8. Set Session Cookie
         ▼
   [AuthController]
         │ 9. Return User Data
         ▼
    [Auth Service]
         │ 10. Store User State
         ▼
   [Login Component]
         │ 11. Redirect to Dashboard
         ▼
      [User]
```

### Filtering Data Flow
```
[User] ──┐
         │ 1. Select Filters
         ▼
  [Filter Component]
         │ 2. Build Filter Object
         ▼
  [Deployment Service]
         │ 3. HTTP GET with Params
         ▼
 [DeploymentController]
         │ 4. Parse Filter Params
         ▼
  [DeploymentService]
         │ 5. Build Query Criteria
         ▼
 [DeploymentRepository]
         │ 6. JPA Criteria Query
         ▼
    [H2 Database]
         │ 7. Execute Filtered Query
         ▼
  [deployment Table]
         │ 8. Return Filtered Results
         ▼
 [DeploymentRepository]
         │ 9. Return to Service
         ▼
  [DeploymentService]
         │ 10. Return to Controller
         ▼
 [DeploymentController]
         │ 11. HTTP Response
         ▼
  [Deployment Service]
         │ 12. Update Request List
         ▼
  [Request List Component]
         │ 13. Display Filtered Results
         ▼
      [User]
```

---

## Security Architecture

### Authentication & Session Management
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Security Layers                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Frontend Security                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│   │
│  │  │  Route      │  │    Auth     │  │   Role      │  │    HTTP     ││   │
│  │  │  Guards     │  │   Service   │  │   Guards    │  │Interceptors ││   │
│  │  │             │  │             │  │             │  │             ││   │
│  │  │ - CanLoad   │  │ - Session   │  │ - Admin     │  │ - Headers   ││   │
│  │  │ - CanActiv  │  │ - State     │  │ - Dev       │  │ - Auth      ││   │
│  │  │             │  │ - Storage   │  │ - Super     │  │ - Error     ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                              HTTPS/Session                                 │
│                                    │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Backend Security                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│   │
│  │  │   CORS      │  │   Session   │  │   Method    │  │   Data      ││   │
│  │  │   Config    │  │   Filter    │  │  Security   │  │Validation   ││   │
│  │  │             │  │             │  │             │  │             ││   │
│  │  │ - Origins   │  │ - Session   │  │ - @PreAuth  │  │ - @Valid    ││   │
│  │  │ - Methods   │  │ - Timeout   │  │ - Role      │  │ - Constraints││   │
│  │  │ - Headers   │  │ - Cleanup   │  │ - Check     │  │ - Format    ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                       │
│                              JPA/SQL                                       │
│                                    │                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      Database Security                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│   │
│  │  │   Schema    │  │   Indexes   │  │ Constraints │  │ Audit Trail ││   │
│  │  │   Access    │  │             │  │             │  │             ││   │
│  │  │             │  │ - Unique    │  │ - Foreign   │  │ - Created   ││   │
│  │  │ - Tables    │  │ - Primary   │  │ - Not Null  │  │ - Modified  ││   │
│  │  │ - Views     │  │ - Business  │  │ - Check     │  │ - By Whom   ││   │
│  │  │             │  │             │  │             │  │             ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Role-Based Access Control Matrix
```
┌─────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│    Resource     │ Superadmin  │   Admin1    │   Admin2    │  Developer  │
├─────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ View Requests   │     ✅      │     ✅      │     ✅      │     ✅      │
│ Create Request  │     ✅      │     ❌      │     ❌      │     ✅      │
│ Edit Own Req    │     ✅      │     ❌      │     ❌      │     ✅      │
│ Edit Any Req    │     ✅      │     ✅      │     ❌      │     ❌      │
│ Edit Status     │     ✅      │     ✅      │     ❌      │     ❌      │
│ Edit RLM IDs    │     ✅      │     ✅      │     ❌      │     ❌      │
│ Prod Ready Own  │     ✅      │     ❌      │     ❌      │     ✅      │
│ Prod Ready Any  │     ✅      │     ❌      │     ❌      │     ❌      │
│ Export Data     │     ✅      │     ✅      │     ✅      │     ✅      │
│ Manage Users    │     ✅      │     ❌      │     ❌      │     ❌      │
└─────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## Development vs Production

### Development Configuration
```yaml
Environment: Development
Database: H2 (Embedded, File-based)
Security: Permissive CORS, Session-based
Logging: DEBUG level, Console output
Build: Development mode, Source maps
Hot Reload: Enabled
Port Configuration:
  Frontend: 4200 (ng serve)
  Backend: 8080 (spring-boot:run)
  Database: N/A (embedded)
```

### Production Configuration (Recommended)
```yaml
Environment: Production
Database: PostgreSQL/MySQL (External)
Security: Restricted CORS, HTTPS only
Logging: INFO/WARN level, File output
Build: Production mode, Minified
Hot Reload: Disabled
Port Configuration:
  Frontend: 80/443 (Nginx/Apache)
  Backend: 8080 (Behind reverse proxy)
  Database: 5432/3306 (External server)
```

### Environment Migration Checklist
```
□ Database Migration
  □ Export H2 data to SQL scripts
  □ Create production database schema
  □ Import data with proper constraints
  □ Set up database connection pooling

□ Security Hardening
  □ Configure HTTPS certificates
  □ Restrict CORS origins
  □ Implement rate limiting
  □ Add input sanitization

□ Performance Optimization
  □ Enable gzip compression
  □ Configure caching headers
  □ Set up connection pooling
  □ Implement monitoring

□ Deployment Setup
  □ Container configuration (Docker)
  □ Orchestration setup (Kubernetes)
  □ CI/CD pipeline configuration
  □ Health check endpoints

□ Monitoring & Logging
  □ Application performance monitoring
  □ Error tracking and alerting
  □ Structured logging
  □ Backup and recovery procedures
```

---

## Performance & Scalability Considerations

### Current Limitations (Development)
- **Single Instance:** No load balancing
- **Embedded Database:** Limited concurrent connections
- **No Caching:** Every request hits database
- **No CDN:** Static assets served locally

### Production Scalability Solutions
- **Load Balancing:** Multiple application instances
- **Database Clustering:** Read replicas, connection pooling
- **Caching Layer:** Redis for session storage and data caching
- **CDN:** Static asset distribution
- **API Gateway:** Rate limiting, request routing
- **Container Orchestration:** Auto-scaling based on demand

This architecture documentation provides a comprehensive view of the deployment portal's technical structure, making it easier for developers and system administrators to understand, maintain, and scale the application.
