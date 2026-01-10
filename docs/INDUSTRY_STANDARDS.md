# Industry Standards Implementation

## Application Starter Kit - Enterprise Grade Features

This document describes all industry-standard features implemented in this project.

---

## Table of Contents

1. [Error Handling](#1-error-handling)
2. [Structured Logging](#2-structured-logging)
3. [Request Context & Correlation ID](#3-request-context--correlation-id)
4. [Rate Limiting](#4-rate-limiting)
5. [Security Headers](#5-security-headers)
6. [Health Checks](#6-health-checks)
7. [API Versioning](#7-api-versioning)
8. [Async/Await Patterns](#8-asyncawait-patterns)
9. [Database Connection Pooling](#9-database-connection-pooling)
10. [Environment Configuration](#10-environment-configuration)

---

## 1. Error Handling

### Custom Exception Classes

Located in `app/utils/exceptions.py`:

```python
# Base exception
AppException(message, status_code, error_code, details)

# Specific exceptions
BadRequestException      # 400
UnauthorizedException    # 401
ForbiddenException       # 403
NotFoundException        # 404
ConflictException        # 409
ValidationException      # 422
RateLimitException       # 429
DatabaseException        # 500
ServiceUnavailableException  # 503
```

### Standardized Error Response

All errors return consistent JSON format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Invalid email format",
          "type": "value_error"
        }
      ]
    },
    "request_id": "abc12345"
  }
}
```

### Exception Handlers

| Handler | Exception Type | Description |
|---------|---------------|-------------|
| `app_exception_handler` | AppException | Custom app exceptions |
| `http_exception_handler` | HTTPException | FastAPI HTTP exceptions |
| `validation_exception_handler` | RequestValidationError | Pydantic validation |
| `sqlalchemy_exception_handler` | SQLAlchemyError | Database errors |
| `global_exception_handler` | Exception | Catch-all handler |

### Usage in Controllers

```python
from app.utils.exceptions import NotFoundException, ConflictException

def get_user(user_id: int, db: Session):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException(
            message=f"User with ID {user_id} not found",
            details={"user_id": user_id}
        )
    return user
```

---

## 2. Structured Logging

### Features

- **JSON Format** (Production) - Machine-readable for log aggregation
- **Colored Format** (Development) - Human-readable console output
- **Correlation ID** - Track requests across services
- **Context Variables** - Thread-safe request context

### Configuration

Located in `app/utils/logging_config.py`:

```python
from app.utils.logging_config import setup_logging, get_logger

# Setup at application start
setup_logging(
    level="INFO",           # Log level
    json_format=True,       # JSON for production
    log_file="app.log"      # Optional file logging
)

# Get logger instance
logger = get_logger(__name__)
logger.info("User created", extra={"user_id": 123})
```

### Log Output (JSON - Production)

```json
{
  "timestamp": "2026-01-10T12:00:00.000Z",
  "level": "INFO",
  "logger": "app.controllers.user",
  "message": "User created",
  "module": "user_controller",
  "function": "create_user",
  "line": 45,
  "request_id": "abc12345",
  "extra": {
    "user_id": 123
  }
}
```

### Log Output (Colored - Development)

```
2026-01-10 12:00:00 | INFO     | [abc12345] app.controllers.user | User created
```

### Log Levels

| Level | Usage |
|-------|-------|
| DEBUG | Detailed debugging (dev only) |
| INFO | General information |
| WARNING | Warning conditions |
| ERROR | Error conditions |
| CRITICAL | Critical failures |

---

## 3. Request Context & Correlation ID

### Features

- Unique request ID for every request
- Tracks request timing
- Client IP extraction
- Request/Response logging

### Middleware

Located in `app/middleware/request_context.py`:

```python
class RequestContextMiddleware:
    # Adds to every request:
    # - request.state.request_id
    # - request.state.start_time
    # - request.state.client_ip
    
    # Adds to every response:
    # - X-Request-ID header
    # - X-Process-Time header
```

### Usage in Routes

```python
@router.get("/users/{user_id}")
async def get_user(user_id: int, request: Request):
    request_id = request.state.request_id
    client_ip = request.state.client_ip
    # Use for logging, auditing, etc.
```

### Response Headers

```
X-Request-ID: abc12345
X-Process-Time: 0.0234
```

---

## 4. Rate Limiting

### Features

- Per-IP rate limiting
- Configurable limits (per minute, per hour)
- Whitelist support
- Sliding window algorithm

### Configuration

Located in `app/middleware/rate_limiter.py`:

```python
app.add_middleware(
    RateLimiterMiddleware,
    requests_per_minute=60,
    requests_per_hour=1000,
    whitelist=["127.0.0.1"],
    enabled=True
)
```

### Response Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 30
  }
}
```

HTTP Status: `429 Too Many Requests`
Header: `Retry-After: 30`

---

## 5. Security Headers

### Headers Added

Located in `app/middleware/security_headers.py`:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | XSS protection |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer |
| Permissions-Policy | (restricted) | Disable unused features |
| Content-Security-Policy | (configured) | XSS/injection protection |
| Strict-Transport-Security | max-age=31536000 | HTTPS enforcement (prod) |

### Configuration

```python
app.add_middleware(
    SecurityHeadersMiddleware,
    enable_hsts=True,  # Enable in production
    hsts_max_age=31536000,
    custom_headers={"X-Custom": "value"}
)
```

---

## 6. Health Checks

### Endpoints

| Endpoint | Purpose | Use Case |
|----------|---------|----------|
| `/health` | Liveness check | Is app running? |
| `/ready` | Readiness check | Is app ready to serve? |
| `/api/system/info` | System info | Debugging/monitoring |

### Liveness Check (`/health`)

```json
{
  "success": true,
  "status": "healthy",
  "message": "API is operational"
}
```

### Readiness Check (`/ready`)

```json
{
  "success": true,
  "status": "ready",
  "checks": {
    "database": {
      "type": "SQLite",
      "connected": true,
      "pool_size": "N/A"
    },
    "api": "operational"
  }
}
```

### Kubernetes Configuration

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 10
```

---

## 7. API Versioning

### Current Implementation

```python
API_V1_PREFIX = "/api"

# All routes use versioned prefix
app.include_router(auth.router, prefix=f"{API_V1_PREFIX}/auth")
```

### Future Versioning

```python
# Version 1
app.include_router(auth_v1.router, prefix="/api/v1/auth")

# Version 2
app.include_router(auth_v2.router, prefix="/api/v2/auth")
```

---

## 8. Async/Await Patterns

### Async Routes

All routes use `async def` for non-blocking I/O:

```python
@router.get("/users")
async def get_users(db: Session = Depends(get_db)):
    # Async route handler
    return users
```

### Async Email Sending

```python
async def send_email_async(to: str, subject: str, body: str):
    # Non-blocking email sending
    await asyncio.to_thread(smtp_send, to, subject, body)
```

### Background Tasks

```python
from fastapi import BackgroundTasks

@router.post("/users")
async def create_user(
    user: UserCreate,
    background_tasks: BackgroundTasks
):
    # Create user
    new_user = create_user_in_db(user)
    
    # Send email in background (non-blocking)
    background_tasks.add_task(send_welcome_email, new_user.email)
    
    return new_user
```

---

## 9. Database Connection Pooling

### Configuration

Located in `app/database.py`:

```python
# Production databases (SQL Server, PostgreSQL, MySQL)
engine_args = {
    "pool_pre_ping": True,    # Check connection before use
    "pool_size": 10,          # Number of connections
    "max_overflow": 20,       # Extra connections when needed
    "pool_recycle": 300,      # Recycle after 5 minutes
}
```

### Benefits

- **Connection Reuse** - Faster queries
- **Health Checks** - Automatic reconnection
- **Resource Management** - Controlled connection count
- **Timeout Handling** - Prevent stale connections

---

## 10. Environment Configuration

### Configuration File

Located in `app/config.py`:

```python
class Settings(BaseSettings):
    APP_NAME: str = "Application Starter Kit"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
```

### Environment-Specific Settings

```env
# Development
DEBUG=true
ENVIRONMENT=development
LOG_LEVEL=DEBUG

# Production
DEBUG=false
ENVIRONMENT=production
LOG_LEVEL=INFO
```

---

## Middleware Stack Order

```
Request → Security Headers → Rate Limiter → Request Context → CORS → Route Handler
                                                                          ↓
Response ← Security Headers ← Rate Limiter ← Request Context ← CORS ← Response
```

---

## Checklist: Industry Standards

| Feature | Status | File |
|---------|--------|------|
| Custom Exceptions | ✅ | `app/utils/exceptions.py` |
| Global Error Handler | ✅ | `app/main.py` |
| Structured Logging | ✅ | `app/utils/logging_config.py` |
| Correlation ID | ✅ | `app/middleware/request_context.py` |
| Rate Limiting | ✅ | `app/middleware/rate_limiter.py` |
| Security Headers | ✅ | `app/middleware/security_headers.py` |
| Health Checks | ✅ | `app/main.py` |
| Readiness Checks | ✅ | `app/main.py` |
| API Versioning | ✅ | `app/main.py` |
| Async/Await | ✅ | All routes |
| Connection Pooling | ✅ | `app/database.py` |
| Environment Config | ✅ | `app/config.py` |
| CORS | ✅ | `app/main.py` |
| Input Validation | ✅ | Pydantic schemas |
| JWT Authentication | ✅ | `app/utils/security.py` |
| Password Hashing | ✅ | bcrypt |

---

## Best Practices Followed

1. **12-Factor App** - Environment-based configuration
2. **REST API Standards** - Proper HTTP methods and status codes
3. **Security First** - Headers, CORS, rate limiting
4. **Observability** - Logging, health checks, metrics
5. **Error Handling** - Consistent error responses
6. **Documentation** - OpenAPI/Swagger auto-generated
7. **Testing** - Pytest with async support
8. **Code Organization** - MVC pattern

---

*Last Updated: January 2026*
*Version: 1.0.0*
