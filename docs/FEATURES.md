# Features Documentation

## Application Starter Kit - Complete Feature Guide

This document provides detailed information about all features available in the Application Starter Kit.

---

## Table of Contents

1. [Authentication System](#1-authentication-system)
2. [Multi-Tenancy](#2-multi-tenancy)
3. [User Management](#3-user-management)
4. [Role-Based Access Control](#4-role-based-access-control)
5. [Email Microservice](#5-email-microservice)
6. [Audit Trail](#6-audit-trail)
7. [Logging System](#7-logging-system)
8. [Security Features](#8-security-features)
9. [Database Support](#9-database-support)

---

## 1. Authentication System

### Overview

The authentication system provides secure user registration, login, and session management using JWT tokens.

### Features

| Feature | Description |
|---------|-------------|
| User Registration | New user signup with email verification |
| Login | Email/password authentication |
| JWT Tokens | Secure token-based authentication |
| Password Hashing | bcrypt with salt |
| Password Reset | Email-based password recovery |
| OTP Verification | 6-digit OTP for registration |

### API Endpoints

```
POST /api/auth/register     - Register new user
POST /api/auth/login        - User login
GET  /api/auth/me           - Get current user
POST /api/auth/logout       - Logout user
PUT  /api/auth/change-password    - Change password
POST /api/auth/forgot-password    - Request password reset
POST /api/auth/verify-reset-token - Verify reset token
POST /api/auth/reset-password     - Reset password with token
```

### Registration Flow

```
User submits form → Validate input → Hash password → Create user (inactive)
                                                            ↓
                                    Account activated ← OTP verified ← Send OTP email
                                            ↓
                                    Send Welcome email
```

### JWT Token Structure

```json
{
  "user_id": 1,
  "email": "user@example.com",
  "role": "admin",
  "company_id": 1,
  "exp": 1704067200
}
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## 2. Multi-Tenancy

### Overview

Multi-tenancy allows multiple companies to use the same application instance with complete data isolation.

### Features

| Feature | Description |
|---------|-------------|
| Company Isolation | Each company's data is completely separate |
| Multiple Companies | Users can belong to multiple companies |
| Company Switching | Seamlessly switch between companies |
| Company-specific Roles | Different roles in different companies |

### API Endpoints

```
GET    /api/companies              - List user's companies
POST   /api/companies              - Create new company
GET    /api/companies/{id}         - Get company details
PUT    /api/companies/{id}         - Update company
DELETE /api/companies/{id}         - Delete company
POST   /api/companies/select/{id}  - Select active company
```

### Company Model

```python
Company:
  - id: int
  - name: str
  - email: str
  - phone: str
  - address: str
  - city: str
  - state: str
  - country: str
  - zip_code: str
  - website: str
  - industry: str
  - status: str (active/inactive)
  - created_at: datetime
  - updated_at: datetime
```

### User-Company Relationship

```
User ←→ UserCompany ←→ Company
         ↓
    - role (per company)
    - is_primary
    - permissions (JSON)
```

---

## 3. User Management

### Overview

Complete user lifecycle management including creation, updates, role assignment, and deactivation.

### Features

| Feature | Description |
|---------|-------------|
| CRUD Operations | Create, Read, Update, Delete users |
| Profile Management | Update profile, avatar |
| Role Assignment | Assign roles per company |
| Activation/Deactivation | Enable/disable user accounts |
| Bulk Operations | Manage multiple users |

### API Endpoints

```
GET    /api/companies/{id}/users              - List company users
POST   /api/companies/{id}/users              - Create user
GET    /api/companies/{id}/users/{user_id}    - Get user details
PUT    /api/companies/{id}/users/{user_id}    - Update user
PUT    /api/companies/{id}/users/{user_id}/role - Update role
DELETE /api/companies/{id}/users/{user_id}    - Delete user
```

### User Model

```python
User:
  - id: int
  - email: str (unique)
  - password_hash: str
  - first_name: str
  - last_name: str
  - phone: str
  - avatar: str
  - role: str
  - is_active: bool
  - is_verified: bool
  - last_login: datetime
  - created_at: datetime
  - updated_at: datetime
```

---

## 4. Role-Based Access Control (RBAC)

### Overview

Granular permission system that controls access to resources based on user roles.

### Default Roles

| Role | Level | Description |
|------|-------|-------------|
| `super_admin` | System | Full system access |
| `admin` | Company | Company administrator |
| `manager` | Department | Can manage users |
| `user` | Basic | Standard access |

### Permission Structure

Permissions follow the `resource:action` pattern:

```
user:create     - Create users
user:read       - View users
user:update     - Update users
user:delete     - Delete users
company:read    - View company
company:update  - Update company
company:delete  - Delete company
permission:manage - Manage permissions
```

### API Endpoints

```
GET  /api/permissions              - List all permissions
POST /api/permissions              - Create permission
POST /api/permissions/check        - Check user permission
GET  /api/permissions/role/{role}  - Get role permissions
POST /api/permissions/assign       - Assign permission to role
POST /api/permissions/revoke       - Revoke permission from role
```

### Permission Check Flow

```python
# In route/controller
@require_permission("user:create")
def create_user():
    # Only users with user:create permission can access
    pass
```

---

## 5. Email Microservice

### Overview

Asynchronous email service using RabbitMQ for reliable email delivery.

### Features

| Feature | Description |
|---------|-------------|
| Async Sending | Non-blocking email delivery |
| Templates | Beautiful HTML templates |
| Retry Mechanism | Automatic retry on failure |
| Dead Letter Queue | Failed emails preserved |
| Multiple Providers | SMTP, SES, SendGrid |

### Email Types

| Email | Template | Trigger |
|-------|----------|---------|
| OTP | `otp.html` | Registration |
| Welcome | `welcome.html` | After verification |
| Password Reset | `password_reset.html` | Forgot password |
| Password Changed | `password_changed.html` | Password updated |
| Login Alert | `login_alert.html` | New device login |
| Company Invitation | `company_invitation.html` | User invited |
| Role Changed | `role_changed.html` | Role updated |
| Account Deactivated | `account_deactivated.html` | Account disabled |
| Account Reactivated | `account_reactivated.html` | Account enabled |
| Notification | `notification.html` | General alerts |

### Usage

```python
from email_service.publisher import email_publisher

# Send welcome email
email_publisher.publish(
    to=["user@example.com"],
    subject="Welcome!",
    template="welcome.html",
    payload={"user_name": "John"}
)
```

### Architecture

```
Main App → RabbitMQ → Email Consumer → SMTP/SES → User Inbox
              ↓
         Retry Queues (30s, 2m, 5m)
              ↓
         Dead Letter Queue
```

---

## 6. Audit Trail

### Overview

Track all changes made to the system for compliance and debugging.

### Features

| Feature | Description |
|---------|-------------|
| Change Tracking | Record all CRUD operations |
| User Attribution | Who made the change |
| Before/After Values | What changed |
| Timestamps | When it happened |
| IP Tracking | From where |

### Audit Model

```python
AuditTrail:
  - id: int
  - user_id: int
  - user_email: str
  - action: str (create/update/delete)
  - resource_type: str
  - resource_id: int
  - old_values: JSON
  - new_values: JSON
  - ip_address: str
  - status: str
  - message: str
  - created_at: datetime
```

### Usage

```python
from app.services.audit_service import create_audit_log

create_audit_log(
    db=db,
    user_id=current_user.id,
    action="update",
    resource_type="user",
    resource_id=user.id,
    old_values={"role": "user"},
    new_values={"role": "admin"}
)
```

---

## 7. Logging System

### Overview

Structured JSON logging for monitoring and debugging.

### Features

| Feature | Description |
|---------|-------------|
| JSON Format | Machine-readable logs |
| Log Levels | DEBUG, INFO, WARNING, ERROR |
| Request Logging | Log all API requests |
| Error Tracking | Capture exceptions |
| Database Logging | Store logs in database |

### Log Model

```python
Log:
  - id: int
  - timestamp: datetime
  - level: str
  - category: str
  - action: str
  - user_id: int
  - user_email: str
  - ip_address: str
  - details: JSON
  - status: str
  - message: str
```

### Log Levels

| Level | Usage |
|-------|-------|
| DEBUG | Detailed debugging info |
| INFO | General information |
| WARNING | Warning messages |
| ERROR | Error messages |
| CRITICAL | Critical failures |

---

## 8. Security Features

### Overview

Enterprise-grade security features to protect your application.

### Features

| Feature | Description |
|---------|-------------|
| Password Hashing | bcrypt with salt |
| JWT Authentication | Secure token-based auth |
| CORS Protection | Cross-origin security |
| Rate Limiting | Prevent abuse |
| Input Validation | Pydantic validation |
| SQL Injection Prevention | SQLAlchemy ORM |

### Password Security

```python
# Password hashing
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

# Password verification
bcrypt.checkpw(password.encode(), hashed)
```

### JWT Configuration

```env
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### CORS Configuration

```env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## 9. Database Support

### Overview

Support for multiple databases to fit different deployment scenarios.

### Supported Databases

| Database | Use Case | Driver |
|----------|----------|--------|
| SQLite | Development | Built-in |
| SQL Server | Enterprise | pyodbc |
| PostgreSQL | Production | psycopg2 |
| MySQL | Web Apps | pymysql |

### Configuration

```env
# SQLite (default)
DATABASE_URL=sqlite:///./app.db

# SQL Server
DATABASE_URL=mssql+pyodbc://user:pass@server/db?driver=ODBC+Driver+17+for+SQL+Server

# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# MySQL
DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/db
```

### Features

- Automatic connection pooling
- Connection health checks
- Automatic table creation
- Migration support (Alembic)

---

## Feature Comparison

| Feature | Free | Enterprise |
|---------|------|------------|
| Authentication | ✅ | ✅ |
| Multi-Tenancy | ✅ | ✅ |
| User Management | ✅ | ✅ |
| RBAC | ✅ | ✅ |
| Email Service | ✅ | ✅ |
| Audit Trail | ✅ | ✅ |
| SQLite Support | ✅ | ✅ |
| SQL Server Support | ✅ | ✅ |
| PostgreSQL Support | ✅ | ✅ |
| MySQL Support | ✅ | ✅ |
| Priority Support | ❌ | ✅ |
| Custom Development | ❌ | ✅ |

---

## Getting Started

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Configure `.env` file
4. Run: `uvicorn app.main:app --reload`
5. Access docs: http://localhost:8000/docs

---

*Last Updated: January 2026*
*Version: 1.0.0*
