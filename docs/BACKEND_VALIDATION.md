# Backend Validation Guide

## Application Starter Kit - Security & Data Integrity

Backend Validation हे सर्व्हर-साइडवर होणारे validation आहे आणि हे कोणत्याही application साठी **सर्वात महत्त्वाचे सुरक्षा कवच** असते.

---

## Table of Contents

1. [Validation Types](#validation-types)
2. [Schema Validation (Pydantic)](#1-schema-validation-pydantic)
3. [Business Rule Validation](#2-business-rule-validation)
4. [Database Validation](#3-database-validation)
5. [Authorization Validation](#4-authorization-validation)
6. [Input Sanitization](#5-input-sanitization)
7. [Validation Flow](#validation-flow)
8. [Usage Examples](#usage-examples)

---

## Validation Types

| Type | Purpose | Location |
|------|---------|----------|
| **Schema Validation** | Data type & structure | Pydantic schemas |
| **Business Rules** | Logic validation | Validators & Controllers |
| **Database Validation** | Uniqueness & integrity | Database constraints |
| **Authorization** | Access control | Middleware & Controllers |
| **Sanitization** | XSS & injection prevention | Validators |

---

## 1. Schema Validation (Pydantic)

### Purpose
येणारा JSON डेटा योग्य type आणि structure मध्ये आहे का ते तपासणे.

### Location
`app/schemas/*.py`

### Example: User Registration

```python
from pydantic import BaseModel, EmailStr, Field, field_validator

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
```

### Auto-Rejected Requests

```json
// Wrong type
{ "name": 123, "age": "twenty" }

// Missing required field
{ "email": "test@test.com" }

// Invalid email
{ "email": "not-an-email" }
```

**Result:** FastAPI returns `422 Validation Error` automatically.

---

## 2. Business Rule Validation

### Purpose
डेटा technically बरोबर असला तरी logically योग्य आहे का ते तपासणे.

### Location
`app/utils/validators.py`

### Password Strength Validation

```python
from app.utils.validators import validate_password_strength

def validate_password_strength(password: str) -> str:
    """
    Requirements:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 digit
    - At least 1 special character
    """
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    if not re.search(r'[A-Z]', password):
        errors.append("Must contain uppercase letter")
    if not re.search(r'[a-z]', password):
        errors.append("Must contain lowercase letter")
    if not re.search(r'[0-9]', password):
        errors.append("Must contain digit")
    if not re.search(r'[@$!%*?&#]', password):
        errors.append("Must contain special character")
    
    if errors:
        raise ValueError("; ".join(errors))
    
    return password
```

### Phone Number Validation

```python
from app.utils.validators import validate_phone

# Valid formats:
# +91 9876543210
# 9876543210
# +1-234-567-8900
```

### URL Validation

```python
from app.utils.validators import validate_url

# Valid: https://example.com
# Invalid: not-a-url
```

### Available Validators

| Validator | Purpose |
|-----------|---------|
| `validate_password_strength` | Strong password check |
| `validate_phone` | Phone number format |
| `validate_gst` | GST number (India) |
| `validate_pan` | PAN number (India) |
| `validate_pincode` | Indian pincode |
| `validate_url` | URL format |
| `validate_name` | Name (letters only) |
| `validate_no_html` | No HTML/script tags |
| `validate_age` | Age range |
| `validate_amount` | Monetary amount |
| `validate_percentage` | 0-100 range |
| `validate_date_range` | Start < End date |

---

## 3. Database Validation

### Purpose
डेटाबेसमध्ये duplicate किंवा conflict data जाण्यापासून रोखणे.

### Location
`app/utils/validators.py`

### Check Unique Email

```python
from app.utils.validators import check_unique_email

def create_user(user: UserCreate, db: Session):
    # Check if email already exists
    check_unique_email(db, User, user.email)
    
    # Proceed with creation
    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
```

### Check Unique Field (Generic)

```python
from app.utils.validators import check_unique_field

# Check unique company name
check_unique_field(db, Company, "name", company.name)

# Check unique with exclusion (for updates)
check_unique_field(db, Company, "name", company.name, exclude_id=company_id)
```

### Check Record Exists

```python
from app.utils.validators import check_exists

# Returns record or raises 404
user = check_exists(db, User, user_id, "User not found")
```

### Database Level Constraints

```python
# In SQLAlchemy model
class User(Base):
    email = Column(String(255), unique=True, nullable=False)
    
# Double protection:
# 1. Application level (check_unique_email)
# 2. Database level (unique=True)
```

---

## 4. Authorization Validation

### Purpose
हा user हा डेटा access / modify करू शकतो का?

### Location
`app/utils/validators.py`

### Check Ownership

```python
from app.utils.validators import check_ownership

def get_invoice(invoice_id: int, current_user: User, db: Session):
    invoice = db.query(Invoice).get(invoice_id)
    
    # Verify user owns this invoice
    check_ownership(invoice, current_user.id, owner_field="user_id")
    
    return invoice
```

### Check Company Access (Multi-tenant)

```python
from app.utils.validators import check_company_access

def get_customer(customer_id: int, current_user: User, db: Session):
    customer = db.query(Customer).get(customer_id)
    
    # Verify customer belongs to user's company
    check_company_access(customer, current_user.company_id)
    
    return customer
```

### Role-Based Access Control

```python
from app.utils.validators import check_role, check_admin, check_super_admin

# Check specific roles
check_role(current_user.role, ["admin", "manager"])

# Check admin access
check_admin(current_user.role)  # admin or super_admin

# Check super admin only
check_super_admin(current_user.role)
```

### Usage in Routes

```python
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only admin can delete users
    check_admin(current_user.role)
    
    # Proceed with deletion
    ...
```

---

## 5. Input Sanitization

### Purpose
Malicious input, XSS, unexpected payloads रोखणे.

### Location
`app/utils/validators.py`

### Sanitize String

```python
from app.utils.validators import sanitize_string

# Removes:
# - Leading/trailing whitespace
# - Null bytes
# - Escapes HTML entities

name = sanitize_string(user_input)
# "<script>alert('xss')</script>" → "&lt;script&gt;alert('xss')&lt;/script&gt;"
```

### Remove HTML Tags

```python
from app.utils.validators import sanitize_html

# Removes all HTML tags
clean_text = sanitize_html("<p>Hello <b>World</b></p>")
# Result: "Hello World"
```

### Validate No HTML (Strict)

```python
from app.utils.validators import validate_no_html

# Raises error if HTML/script detected
validate_no_html(user_input)

# Detects:
# - <script> tags
# - javascript: URLs
# - Event handlers (onclick, onerror, etc.)
# - <iframe>, <object>, <embed>
```

### Normalize Email

```python
from app.utils.validators import normalize_email

email = normalize_email("  User@Example.COM  ")
# Result: "user@example.com"
```

---

## Validation Flow

```
Request
   ↓
┌─────────────────────────────────┐
│  1. Pydantic Schema Validation  │  ← Type, structure, format
│     (Automatic by FastAPI)      │
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│  2. Authentication              │  ← JWT token valid?
│     (Middleware)                │
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│  3. Authorization               │  ← User has permission?
│     (check_role, check_admin)   │
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│  4. Business Rules              │  ← Logic validation
│     (Custom validators)         │
└─────────────────────────────────┘
   ↓
┌─────────────────────────────────┐
│  5. Database Constraints        │  ← Unique, foreign keys
│     (check_unique, check_exists)│
└─────────────────────────────────┘
   ↓
Commit to Database
```

---

## Usage Examples

### Complete User Registration

```python
# app/schemas/auth.py
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None
    
    @field_validator('email')
    @classmethod
    def normalize_email_field(cls, v):
        return normalize_email(v)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        return validate_password_strength(v)
    
    @field_validator('first_name', 'last_name')
    @classmethod
    def validate_names(cls, v):
        v = sanitize_string(v)
        validate_no_html(v)
        return validate_name(v)
    
    @field_validator('phone')
    @classmethod
    def validate_phone_field(cls, v):
        if v:
            return validate_phone(v)
        return v


# app/controllers/auth_controller.py
class AuthController:
    @staticmethod
    def register_user(user_data: UserRegister, db: Session):
        # 1. Schema validation - done by Pydantic
        
        # 2. Database validation - check unique email
        check_unique_email(db, User, user_data.email)
        
        # 3. Create user
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            password_hash=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone
        )
        
        db.add(new_user)
        db.commit()
        return new_user
```

### Protected Route with Authorization

```python
@router.put("/companies/{company_id}")
async def update_company(
    company_id: int,
    company_data: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Check user is admin
    check_admin(current_user.role)
    
    # 2. Check company exists
    company = check_exists(db, Company, company_id)
    
    # 3. Check user has access to this company
    check_company_access(company, current_user.company_id)
    
    # 4. Check unique name (if changing)
    if company_data.name:
        check_unique_field(db, Company, "name", company_data.name, exclude_id=company_id)
    
    # 5. Update company
    for key, value in company_data.dict(exclude_unset=True).items():
        setattr(company, key, value)
    
    db.commit()
    return company
```

---

## Error Responses

### Validation Error (422)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "errors": [
        {
          "field": "password",
          "message": "Password must contain at least one special character",
          "type": "value_error"
        }
      ]
    }
  }
}
```

### Conflict Error (409)

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email already registered"
  }
}
```

### Forbidden Error (403)

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

---

## Best Practices

1. **Never trust frontend** - Always validate on backend
2. **Validate early** - Fail fast before database operations
3. **Sanitize all input** - Prevent XSS and injection
4. **Use both levels** - Application + Database constraints
5. **Clear error messages** - Help users fix issues
6. **Log validation failures** - Monitor for attacks

---

## Files Reference

| File | Purpose |
|------|---------|
| `app/utils/validators.py` | All validation functions |
| `app/schemas/auth.py` | Auth schema validations |
| `app/schemas/user.py` | User schema validations |
| `app/schemas/company.py` | Company schema validations |
| `app/utils/exceptions.py` | Custom exceptions |

---

*Last Updated: January 2026*
