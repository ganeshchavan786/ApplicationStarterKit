# Database Configuration Guide

## Supported Databases

Application Starter Kit supports multiple databases out of the box:

| Database | Use Case | Connection String |
|----------|----------|-------------------|
| **SQLite** | Local development, testing | `sqlite:///./app.db` |
| **SQL Server** | Enterprise, production | `mssql+pyodbc://...` |
| **PostgreSQL** | Production, cloud | `postgresql://...` |
| **MySQL** | Web applications | `mysql+pymysql://...` |

---

## Quick Setup

### 1. SQLite (Default - Recommended for Development)

SQLite requires no additional setup. It's included with Python.

```env
# .env
DATABASE_URL=sqlite:///./app.db
```

**Pros:**
- Zero configuration
- No server required
- Perfect for development and testing
- Single file database

**Cons:**
- Not suitable for high-traffic production
- Limited concurrent writes

---

### 2. SQL Server (Recommended for Enterprise/Production)

#### Prerequisites

1. Install ODBC Driver for SQL Server:
   - Windows: Download from [Microsoft](https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)
   - Linux: 
     ```bash
     curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
     apt-get update
     apt-get install -y msodbcsql17
     ```

2. Install Python driver:
   ```bash
   pip install pyodbc
   ```

#### Connection String

```env
# .env
DATABASE_URL=mssql+pyodbc://username:password@server_name/database_name?driver=ODBC+Driver+17+for+SQL+Server
```

#### Examples

```env
# Local SQL Server
DATABASE_URL=mssql+pyodbc://sa:YourPassword123@localhost/StarterKitDB?driver=ODBC+Driver+17+for+SQL+Server

# SQL Server with Windows Authentication
DATABASE_URL=mssql+pyodbc://@localhost/StarterKitDB?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes

# Azure SQL Database
DATABASE_URL=mssql+pyodbc://admin:Password123@yourserver.database.windows.net/StarterKitDB?driver=ODBC+Driver+17+for+SQL+Server
```

**Pros:**
- Enterprise-grade performance
- Excellent for Windows environments
- Strong security features
- Great tooling (SSMS)

**Cons:**
- Requires license for production
- More complex setup

---

### 3. PostgreSQL (Popular for Production)

#### Prerequisites

1. Install PostgreSQL server
2. Install Python driver:
   ```bash
   pip install psycopg2-binary
   ```

#### Connection String

```env
# .env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

#### Examples

```env
# Local PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/starterkit

# Docker PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/starterkit

# Heroku PostgreSQL
DATABASE_URL=postgresql://user:pass@ec2-xx-xx-xx-xx.compute-1.amazonaws.com:5432/dbname

# AWS RDS PostgreSQL
DATABASE_URL=postgresql://admin:password@mydb.xxxxx.us-east-1.rds.amazonaws.com:5432/starterkit
```

#### Docker Setup

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=starterkit \
  -p 5432:5432 \
  postgres:15
```

**Pros:**
- Free and open source
- Excellent performance
- Rich feature set
- Great for cloud deployments

**Cons:**
- Requires server setup

---

### 4. MySQL (Popular for Web Applications)

#### Prerequisites

1. Install MySQL server
2. Install Python driver:
   ```bash
   pip install pymysql
   ```

#### Connection String

```env
# .env
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/database_name
```

#### Examples

```env
# Local MySQL
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/starterkit

# Docker MySQL
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/starterkit

# AWS RDS MySQL
DATABASE_URL=mysql+pymysql://admin:password@mydb.xxxxx.us-east-1.rds.amazonaws.com:3306/starterkit
```

#### Docker Setup

```bash
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=starterkit \
  -p 3306:3306 \
  mysql:8
```

**Pros:**
- Widely used
- Good performance
- Easy to use
- Great hosting support

**Cons:**
- Some advanced features require paid version

---

## Database Selection Guide

| Scenario | Recommended Database |
|----------|---------------------|
| Local development | SQLite |
| Small projects | SQLite or PostgreSQL |
| Enterprise/Corporate | SQL Server |
| Cloud deployment | PostgreSQL |
| Shared hosting | MySQL |
| High traffic | PostgreSQL or SQL Server |
| Windows environment | SQL Server |
| Linux environment | PostgreSQL |

---

## Switching Databases

### Step 1: Update .env

```env
# Change from SQLite to SQL Server
# DATABASE_URL=sqlite:///./app.db
DATABASE_URL=mssql+pyodbc://sa:Password@localhost/StarterKitDB?driver=ODBC+Driver+17+for+SQL+Server
```

### Step 2: Install Driver

```bash
# For SQL Server
pip install pyodbc

# For PostgreSQL
pip install psycopg2-binary

# For MySQL
pip install pymysql
```

### Step 3: Create Database

```sql
-- SQL Server
CREATE DATABASE StarterKitDB;

-- PostgreSQL
CREATE DATABASE starterkit;

-- MySQL
CREATE DATABASE starterkit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4: Run Application

```bash
uvicorn app.main:app --reload
```

Tables will be created automatically on first run.

---

## Connection Pooling

For production databases (SQL Server, PostgreSQL, MySQL), connection pooling is automatically configured:

```python
# Default pool settings
pool_size = 10        # Number of connections to keep
max_overflow = 20     # Extra connections when pool is full
pool_recycle = 300    # Recycle connections after 5 minutes
pool_pre_ping = True  # Check connection before use
```

---

## Database Migrations (Alembic)

### Initialize Alembic

```bash
alembic init alembic
```

### Create Migration

```bash
alembic revision --autogenerate -m "Initial migration"
```

### Apply Migration

```bash
alembic upgrade head
```

### Rollback Migration

```bash
alembic downgrade -1
```

---

## Troubleshooting

### SQLite

**Error:** `database is locked`
- Solution: Close other connections or use WAL mode

### SQL Server

**Error:** `Can't find ODBC driver`
- Solution: Install ODBC Driver 17 for SQL Server

**Error:** `Login failed`
- Solution: Check username/password and SQL Server authentication mode

### PostgreSQL

**Error:** `connection refused`
- Solution: Check if PostgreSQL is running and port is correct

**Error:** `password authentication failed`
- Solution: Check pg_hba.conf and password

### MySQL

**Error:** `Access denied`
- Solution: Check username/password and user privileges

---

## Best Practices

1. **Development:** Use SQLite for simplicity
2. **Testing:** Use SQLite with in-memory database
3. **Staging:** Use same database as production
4. **Production:** Use SQL Server, PostgreSQL, or MySQL with proper backups

---

## Environment-Specific Configuration

```env
# Development (.env.development)
DATABASE_URL=sqlite:///./app.db

# Testing (.env.test)
DATABASE_URL=sqlite:///:memory:

# Staging (.env.staging)
DATABASE_URL=postgresql://user:pass@staging-db:5432/starterkit

# Production (.env.production)
DATABASE_URL=mssql+pyodbc://user:pass@prod-server/StarterKitDB?driver=ODBC+Driver+17+for+SQL+Server
```

---

*Last Updated: January 2026*
