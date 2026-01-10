# Email Flow Documentation

## Application Starter Kit - Email Microservice

यह document application मध्ये email कसे काम करतात ते explain करतो.

---

## Architecture Overview

```
┌─────────────────┐     ┌───────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Main App       │────▶│   RabbitMQ    │────▶│  Email Consumer  │────▶│ Email Provider │
│  (FastAPI)      │     │   (Broker)    │     │  (Microservice)  │     │ (SMTP/SES)     │
└─────────────────┘     └───────────────┘     └──────────────────┘     └────────────────┘
        │                      │                       │
        │                      ▼                       ▼
        │               ┌───────────┐           ┌───────────┐
        │               │  Retry    │           │  Templates│
        │               │  Queues   │           │  (Jinja2) │
        │               └───────────┘           └───────────┘
        │                      │
        │                      ▼
        │               ┌───────────┐
        │               │    DLQ    │
        │               └───────────┘
        │
        ▼
  ┌───────────┐
  │   Redis   │ ◄── Idempotency (Duplicate Prevention)
  └───────────┘
```

---

## Complete User Journey with Emails

### 1. User Registration Flow

```
Step 1: User Registration
─────────────────────────
┌──────────┐      ┌──────────────┐      ┌─────────────────┐
│  User    │─────▶│  /register   │─────▶│  OTP Email      │
│  Signs Up│      │  API         │      │  (otp.html)     │
└──────────┘      └──────────────┘      └─────────────────┘

Step 2: OTP Verification
─────────────────────────
┌──────────┐      ┌──────────────┐      ┌─────────────────┐
│  User    │─────▶│  /verify-otp │─────▶│  Welcome Email  │
│  Enters  │      │  API         │      │  (welcome.html) │
│  OTP     │      └──────────────┘      └─────────────────┘
└──────────┘
```

**Flow:**
1. User `/register` API call करतो
2. System OTP generate करतो (6-digit)
3. **OTP Email** पाठवतो (`otp.html`)
4. User OTP enter करतो `/verify-otp`
5. OTP verify झाल्यावर **Welcome Email** पाठवतो (`welcome.html`)
6. User account active!

---

### 2. Password Management Flow

```
Forgot Password
───────────────
┌──────────┐      ┌──────────────┐      ┌─────────────────┐
│  User    │─────▶│ /forgot-pwd  │─────▶│ Password Reset  │
│  Clicks  │      │  API         │      │ Email           │
│  Forgot  │      └──────────────┘      └─────────────────┘
└──────────┘

Password Reset
──────────────
┌──────────┐      ┌──────────────┐      ┌─────────────────┐
│  User    │─────▶│ /reset-pwd   │─────▶│ Password Changed│
│  Resets  │      │  API         │      │ Notification    │
│  Password│      └──────────────┘      └─────────────────┘
└──────────┘

Change Password (Logged In)
───────────────────────────
┌──────────┐      ┌──────────────┐      ┌─────────────────┐
│  User    │─────▶│ /change-pwd  │─────▶│ Password Changed│
│  Changes │      │  API         │      │ Notification    │
│  Password│      └──────────────┘      └─────────────────┘
└──────────┘
```

**Flow:**
1. User "Forgot Password" click करतो
2. Email enter करतो → `/forgot-password` API
3. System **Password Reset Email** पाठवतो (reset link सह)
4. User link click करतो → reset page
5. नवीन password set करतो → `/reset-password` API
6. System **Password Changed Email** पाठवतो (security notification)

---

### 3. Security Alerts Flow

```
New Login Detection
───────────────────
┌──────────┐      ┌──────────────┐      ┌─────────────────┐
│  User    │─────▶│  /login      │─────▶│  Login Alert    │
│  Logs In │      │  API         │      │  Email          │
│  (New    │      │  (detects    │      │  (login_alert)  │
│  Device) │      │  new device) │      └─────────────────┘
└──────────┘      └──────────────┘
```

**Flow:**
1. User login करतो
2. System IP address आणि device check करतो
3. जर नवीन device/location असेल → **Login Alert Email** पाठवतो
4. Email मध्ये "Was this you?" option असतो

---

### 4. Company Management Flow

```
Company Invitation
──────────────────
┌──────────┐      ┌──────────────┐      ┌─────────────────┐
│  Admin   │─────▶│ /invite-user │─────▶│ Company Invite  │
│  Invites │      │  API         │      │ Email           │
│  User    │      └──────────────┘      └─────────────────┘
└──────────┘

Role Change
───────────
┌──────────┐      ┌──────────────┐      ┌─────────────────┐
│  Admin   │─────▶│ /update-role │─────▶│  Role Changed   │
│  Changes │      │  API         │      │  Email          │
│  Role    │      └──────────────┘      └─────────────────┘
└──────────┘
```

**Flow:**
1. Admin company settings मध्ये जातो
2. "Invite User" click करतो → email enter करतो
3. System **Company Invitation Email** पाठवतो
4. User email मध्ये "Accept" click करतो
5. User company मध्ये add होतो

---

### 5. Account Status Flow

```
Account Deactivation
────────────────────
┌──────────┐      ┌──────────────┐      ┌─────────────────┐
│  Admin   │─────▶│ /deactivate  │─────▶│ Account         │
│  Deactiv │      │  API         │      │ Deactivated     │
│  User    │      └──────────────┘      │ Email           │
└──────────┘                            └─────────────────┘

Account Reactivation
────────────────────
┌──────────┐      ┌──────────────┐      ┌─────────────────┐
│  Admin   │─────▶│ /reactivate  │─────▶│ Account         │
│  Reactiv │      │  API         │      │ Reactivated     │
│  User    │      └──────────────┘      │ Email           │
└──────────┘                            └─────────────────┘
```

---

## Email Templates Summary

| # | Email Type | Template File | Trigger Event |
|---|------------|---------------|---------------|
| 1 | OTP Verification | `otp.html` | User registration |
| 2 | Welcome | `welcome.html` | OTP verified successfully |
| 3 | Email Verification | `verification.html` | Email verify request |
| 4 | Password Reset | `password_reset.html` | Forgot password request |
| 5 | Password Changed | `password_changed.html` | Password reset/change |
| 6 | Login Alert | `login_alert.html` | New device/location login |
| 7 | Company Invitation | `company_invitation.html` | Admin invites user |
| 8 | Role Changed | `role_changed.html` | User role updated |
| 9 | Account Deactivated | `account_deactivated.html` | Account deactivated |
| 10 | Account Reactivated | `account_reactivated.html` | Account reactivated |
| 11 | Notification | `notification.html` | General notifications |

---

## Typical User Scenarios

### Scenario 1: New User Registration

```
Day 1: New User Signs Up
────────────────────────
1. User visits registration page
2. Enters: email, password, name, phone
3. Clicks "Register"
4. ✉️ Receives OTP Email (Code: 847291)
5. Enters OTP on verification page
6. ✉️ Receives Welcome Email
7. Redirected to dashboard
8. User is now active!
```

### Scenario 2: Forgot Password

```
User Forgets Password
─────────────────────
1. User clicks "Forgot Password" on login page
2. Enters email address
3. ✉️ Receives Password Reset Email (with link)
4. Clicks reset link in email
5. Enters new password
6. ✉️ Receives Password Changed Notification
7. Can now login with new password
```

### Scenario 3: Admin Invites Team Member

```
Admin Invites User to Company
─────────────────────────────
1. Admin goes to Company Settings
2. Clicks "Invite User"
3. Enters user's email and selects role
4. ✉️ User receives Company Invitation Email
5. User clicks "Accept Invitation"
6. User added to company with assigned role
7. ✉️ (Optional) User receives Welcome to Company email
```

### Scenario 4: Security Alert

```
Login from New Device
─────────────────────
1. User logs in from new laptop
2. System detects new IP/device
3. ✉️ User receives Login Alert Email
4. Email shows: Time, IP, Location, Device
5. If suspicious → User can secure account
6. If legitimate → No action needed
```

---

## Code Integration Examples

### Sending OTP Email (Registration)

```python
from email_service.publisher import email_publisher

def send_otp_email(email: str, user_name: str, otp_code: str):
    email_publisher.publish(
        to=[email],
        subject=f"Your OTP Code: {otp_code}",
        template="otp.html",
        payload={
            "user_name": user_name,
            "otp_code": otp_code,
            "expiry_minutes": "10"
        }
    )
```

### Sending Welcome Email

```python
def send_welcome_email(email: str, user_name: str):
    email_publisher.publish(
        to=[email],
        subject="Welcome to Application Starter Kit!",
        template="welcome.html",
        payload={
            "user_name": user_name,
            "login_url": "https://app.example.com/login"
        }
    )
```

### Sending Password Reset Email

```python
def send_password_reset_email(email: str, user_name: str, reset_token: str):
    reset_link = f"https://app.example.com/reset-password?token={reset_token}"
    
    email_publisher.publish(
        to=[email],
        subject="Reset Your Password",
        template="password_reset.html",
        payload={
            "user_name": user_name,
            "reset_link": reset_link
        }
    )
```

### Sending Login Alert

```python
def send_login_alert(email: str, user_name: str, login_info: dict):
    email_publisher.publish(
        to=[email],
        subject="New Login to Your Account",
        template="login_alert.html",
        payload={
            "user_name": user_name,
            "login_time": login_info["time"],
            "ip_address": login_info["ip"],
            "location": login_info["location"],
            "device": login_info["device"],
            "browser": login_info["browser"]
        }
    )
```

---

## Email Service Configuration

### Environment Variables (.env)

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@example.com
SMTP_FROM_NAME=Application Starter Kit

# RabbitMQ (for async emails)
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# Redis (for idempotency)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Templates Location

```
email_service/templates/
├── base.html                 # Base template (header, footer, styling)
├── otp.html                  # OTP verification code
├── welcome.html              # Welcome after registration
├── verification.html         # Email verification link
├── password_reset.html       # Password reset link
├── password_changed.html     # Password changed notification
├── login_alert.html          # New login security alert
├── company_invitation.html   # Company invitation
├── role_changed.html         # Role change notification
├── account_deactivated.html  # Account deactivated
├── account_reactivated.html  # Account reactivated
└── notification.html         # General notifications
```

---

## Testing Emails

### Run All Email Tests

```bash
cd ApplicationStarterKit
.\venv\Scripts\python tests\test_all_emails.py
```

### Test Single Email Type

```bash
.\venv\Scripts\python tests\test_smtp_multi.py
```

### Check Emails on Yopmail

- https://yopmail.com/ganesha
- https://yopmail.com/starterkit1
- https://yopmail.com/testuser123

---

## Error Handling

| Error Type | Action |
|------------|--------|
| SMTP Timeout | Retry (3 times) |
| Network Error | Retry |
| Invalid Email | Send to DLQ |
| Template Missing | Send to DLQ |
| Auth Error | Send to DLQ |
| Duplicate Message | ACK + Ignore |

---

## Best Practices

1. **Always use templates** - Never hardcode HTML in code
2. **Include unsubscribe link** - For marketing emails
3. **Test before production** - Use Yopmail for testing
4. **Monitor DLQ** - Check failed emails regularly
5. **Use meaningful subjects** - Clear and concise
6. **Mobile-friendly** - All templates should be responsive

---

*Last Updated: January 2026*
*Version: 1.0.0*
