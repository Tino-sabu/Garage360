# Garage360 Database Setup Guide

This directory contains the PostgreSQL database schema and setup files for the Garage360 Vehicle Service Management System.

## Prerequisites

- PostgreSQL 13 or higher installed and running
- Database user with CREATE DATABASE privileges
- VS Code with PostgreSQL extension (recommended)

## Quick Setup

### 1. Create Database and User

Connect to PostgreSQL as superuser (postgres) and run:

```sql
-- Create database
CREATE DATABASE garage360
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    TEMPLATE template0;

-- Create application user
CREATE USER garage360_app WITH 
    PASSWORD 'garage360_secure_pass_2025'
    CREATEDB
    LOGIN;

-- Grant privileges
GRANT CONNECT ON DATABASE garage360 TO garage360_app;
GRANT ALL PRIVILEGES ON DATABASE garage360 TO garage360_app;
```

### 2. Setup Tables

Connect to garage360 database:
```bash
psql -U garage360_app -d garage360
```

Then run the schema:
```sql
\i database/schema.sql
```

### 3. Load Sample Data (Optional)

```sql
\i database/seeds/sample_data.sql
```

## Alternative Setup Methods

### Method 1: Using Complete Setup Script
```bash
psql -U postgres -f database/setup_complete.sql
```

### Method 2: Step by Step
1. `psql -U postgres -f database/create_database.sql`
2. `psql -U garage360_app -d garage360 -f database/schema.sql`
3. `psql -U garage360_app -d garage360 -f database/seeds/sample_data.sql`

## VS Code Integration

1. Install PostgreSQL extension: `ckolkman.vscode-postgres`
2. Add connection in VS Code:
   - Host: localhost
   - Database: garage360
   - Username: garage360_app
   - Password: garage360_secure_pass_2025
   - Port: 5432

## Environment Configuration

Create `.env` file in server directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=garage360
DB_USER=garage360_app
DB_PASSWORD=garage360_secure_pass_2025
DATABASE_URL=postgresql://garage360_app:garage360_secure_pass_2025@localhost:5432/garage360
```

## Database Schema Overview

### Core Tables

1. **users** - User management (customers, mechanics, managers, admins)
2. **vehicles** - Vehicle information and registration
3. **services** - Service catalog and pricing
4. **service_requests** - Service booking and tracking
5. **parts** - Inventory management
6. **service_parts** - Parts used in services
7. **invoices** - Billing information
8. **payments** - Payment tracking
9. **activity_logs** - Audit trail

### Key Features

- UUID primary keys for security
- Automatic timestamp management
- Inventory tracking with stock alerts
- Comprehensive audit logging
- Role-based access control
- Financial reporting views

### Default Login Credentials

After running the schema:

- **Admin**: admin@garage360.com / admin123
- **Test Users**: Available in sample_data.sql with password 'password123'

## Maintenance

### Backup

```bash
pg_dump -U garage360_user garage360 > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
psql -U garage360_user -d garage360 < backup_file.sql
```

## Views and Reports

The schema includes several views for common queries:

- `service_request_summary` - Complete service information
- `inventory_status` - Stock levels and alerts  
- `financial_summary` - Monthly revenue reports