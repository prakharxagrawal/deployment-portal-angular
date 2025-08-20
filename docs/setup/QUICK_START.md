# Database Setup & Next Steps Guide

## 📋 For Your Database Expert

### Quick Setup (5 minutes)
Your DB expert can run this single script to set up everything:

**File**: `docs/setup/database_setup.sql`

```bash
# Connect to PostgreSQL as admin
psql -U postgres -h your-database-host

# Run the setup script
\i /path/to/database_setup.sql
```

This creates:
- ✅ Database: `deployment_portal`
- ✅ User: `deployment_user` 
- ✅ All 5 tables with proper constraints
- ✅ Indexes for performance
- ✅ Initial data (users, services, releases)

### Database Details
- **Database Name**: `deployment_portal`
- **Username**: `deployment_user`
- **Password**: `DeploymentPortal2025!` (change in production)
- **Tables**: 5 tables (users, services, releases, deployment, deployment_environments)
- **Records**: ~180 services, 3 users, 3 releases

---

## 🔧 Application Configuration Update

After database setup, update your `application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://your-host:5432/deployment_portal
spring.datasource.username=deployment_user
spring.datasource.password=DeploymentPortal2025!
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration  
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

---

## 🚀 Next Steps After Database Setup

### 1. Test Database Connection
```bash
cd backend/deployment-portal
mvn spring-boot:run
```

Check logs for:
- ✅ "HikariPool-1 - Start completed"
- ✅ "Started Application"
- ❌ No connection errors

### 2. Verify Data Loading
Access H2 console or connect to PostgreSQL:
```sql
SELECT COUNT(*) FROM users;     -- Should return 3
SELECT COUNT(*) FROM services;  -- Should return 180
SELECT COUNT(*) FROM releases;  -- Should return 3
```

### 3. Test Application Features
1. **Login**: Use `admin/admin123` or `developer1/dev123`
2. **Create Deployment**: Test deployment request creation
3. **Filter Data**: Test the filtering functionality
4. **Export CSV**: Verify CSV export works

### 4. Frontend Setup
```bash
cd frontend/deployment-portal-frontend
npm install
ng serve
```

Access: http://localhost:4200

---

## 🔐 Security Checklist (Before Production)

### Database Security
- [ ] Change default passwords
- [ ] Enable SSL/TLS connections
- [ ] Set up proper firewall rules
- [ ] Create database backups
- [ ] Set up monitoring

### Application Security
- [ ] Implement password encryption (BCrypt)
- [ ] Configure JWT secrets
- [ ] Set up HTTPS
- [ ] Review CORS settings
- [ ] Enable security headers

---

## 📊 Production Considerations

### Performance
- **Expected Load**: Medium (100+ concurrent users)
- **Data Growth**: ~1000 deployments/month
- **Backup Strategy**: Daily automated backups
- **Monitoring**: Database performance metrics

### Scaling
- Connection pooling configured
- Indexes on frequently queried columns
- Consider read replicas for reporting

### Maintenance
```sql
-- Regular maintenance queries
VACUUM ANALYZE;  -- Weekly
REINDEX;         -- Monthly
```

---

## 🆘 Troubleshooting

### Common Issues

**Connection Refused**
```
Error: Connection to localhost:5432 refused
```
- Check PostgreSQL is running
- Verify connection parameters
- Check firewall settings

**Authentication Failed**
```
Error: password authentication failed for user "deployment_user"
```
- Verify username/password in application.properties
- Check PostgreSQL user exists

**Table Not Found**
```
Error: relation "users" does not exist
```
- Verify database setup script ran successfully
- Check application is connecting to correct database

### Debug Steps
1. Test direct database connection
2. Check application logs
3. Verify schema exists
4. Test with H2 database first

---

## 📞 Support

**Documentation**:
- Complete setup: `docs/setup/DATABASE_SETUP.md`
- Application config: `docs/technical/DEVELOPMENT_GUIDE.md`

**Quick Test**:
```bash
# Test backend
mvn spring-boot:run

# Test frontend  
ng serve

# Verify both running at:
# Backend: http://localhost:8080
# Frontend: http://localhost:4200
```

Your system should be ready for development/testing after these steps!
