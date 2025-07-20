# Deployment Portal Application

A comprehensive Spring Boot + Angular application for managing deployment requests with role-based access control, advanced filtering, and CSV export capabilities.

## Documentation Structure

This project contains several documentation files to help you understand and work with the deployment portal:

### 🎯 Executive Summary
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Executive overview, business value, and project achievements

### 📋 Main Documentation
- **[APPLICATION_OVERVIEW.md](./APPLICATION_OVERVIEW.md)** - High-level application overview, features, and business logic
- **[USER_GUIDE.md](./USER_GUIDE.md)** - Complete user guide for all roles (developers, admins, superadmins)
- **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)** - Technical architecture, API documentation, and implementation details
- **[DEVELOPER_SETUP.md](./DEVELOPER_SETUP.md)** - Development environment setup and deployment instructions
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete REST API reference documentation
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Database design, relationships, and sample data
- **[DATABASE_ACCESS_GUIDE.md](./DATABASE_ACCESS_GUIDE.md)** - 🗄️ Complete guide for accessing the H2 database during runtime
- **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)** - System architecture, deployment diagrams, and data flow

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Angular CLI 16+
- Maven 3.6+

### Backend Setup
```bash
cd backend/deployment-portal
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend/deployment-portal-frontend
npm install
npm start
```

## Application Access
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:8080/api
- **Database Console:** http://localhost:8080/h2-console 🗄️

## Database Access (H2 Console)
- **JDBC URL:** `jdbc:h2:mem:deploymentdb`
- **Username:** `sa`
- **Password:** (leave empty)
- **Driver:** `org.h2.Driver`

📖 **See [DATABASE_ACCESS_GUIDE.md](./DATABASE_ACCESS_GUIDE.md) for complete database access instructions**

## Default Users
- **Superadmin:** superadmin / admin123
- **Admin:** admin1 / admin123
- **Developer:** dev1 / dev123

## ✨ Key Features

### 🔐 Role-Based Access Control
- **4 User Roles:** Superadmin, Admin, Developer with specific permissions
- **Session Management:** 12-hour persistent sessions
- **Secure Authentication:** Session-based with CORS protection

### 📋 Deployment Management
- **Request Lifecycle:** Open → In Progress → Pending → Completed
- **Environment Support:** DEV, UAT, PERF, PROD environments
- **RLM ID Tracking:** Environment-specific deployment identifiers
- **Production Ready:** Formal approval process for production deployments

### 🎯 Release Management
- **Create Releases:** Admin-only release creation with YYYY-MM format
- **Release Validation:** Automatic format and uniqueness validation
- **Release Tracking:** Link all deployments to specific releases
- **Chronological Display:** Latest releases displayed first

### 🔍 Advanced Filtering & Search
- **Universal Search:** Search across MSDR numbers, services, and dates
- **7 Filter Categories:** Status, Environment, Team, Release, Service, User, Date
- **Real-time Filtering:** Instant results as you type or select
- **Clear Filters:** One-click filter reset

### 📊 Reporting & Export
- **CSV Export:** Complete deployment data export
- **Date Range Filtering:** Export deployments by requested date range
- **Multi-filter Export:** Combine multiple filters for precise exports
- **Management Reports:** Comprehensive audit trails for compliance

### 🎨 Modern UI/UX
- **Material Design:** Clean, professional interface
- **Responsive Layout:** Works on desktop and mobile devices
- **Real-time Updates:** Live status changes and progress tracking
- **Intuitive Navigation:** Easy-to-use interface for all user roles

## Technology Stack
- **Backend:** Spring Boot 2.7+, JPA, H2 Database, Maven
- **Frontend:** Angular 16+, TypeScript, Angular Material, Standalone Components
- **Security:** Session-based authentication with role-based authorization

## Quick Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Java version
java -version

# Clean and rebuild
cd backend/deployment-portal
mvn clean install
mvn spring-boot:run
```

**Frontend won't start:**
```bash
# Check Node.js version
node --version

# Clear cache and reinstall
cd frontend/deployment-portal-frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

**Database issues:**
```bash
# Delete database files to reset
rm backend/deployment-portal/testdb*
# Restart backend - database will be recreated
```

**Port conflicts:**
```bash
# Backend (kill process on port 8080)
lsof -ti:8080 | xargs kill -9

# Frontend (kill process on port 4200)
lsof -ti:4200 | xargs kill -9
```

## Project Structure
```
deployment-portal-angular/
├── backend/
│   └── deployment-portal/          # Spring Boot application
│       ├── src/main/java/          # Java source code
│       ├── src/main/resources/     # Configuration & data
│       └── pom.xml                 # Maven dependencies
├── frontend/
│   └── deployment-portal-frontend/ # Angular application
│       ├── src/app/                # Angular components & services
│       ├── src/assets/             # Static assets
│       └── package.json            # NPM dependencies
└── *.md                           # Documentation files
```

## Support & Contributing
For development support or questions about this deployment portal:

1. **Check Documentation:** Review the comprehensive docs in this repository
2. **Common Issues:** See troubleshooting section above
3. **Technical Details:** Refer to TECHNICAL_DOCUMENTATION.md
4. **API Issues:** Check API_REFERENCE.md for endpoint details

## License
This project is proprietary software developed for internal deployment management.
