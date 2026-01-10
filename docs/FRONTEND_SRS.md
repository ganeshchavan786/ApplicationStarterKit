# 📘 Frontend SRS - Application Starter Kit Web Interface

**Version:** 2.0  
**Tech Stack:** Pure HTML + Vanilla JS + Custom CSS (NO Tailwind, NO Framework)  
**Design Inspiration:** Flowbite + Linear + Stripe  
**Target:** Production-grade SaaS Admin Dashboard  
**Date:** January 2026

---

## 1️⃣ Overview

### 1.1 Purpose
FastAPI Application Starter Kit साठी complete, production-ready web interface.

**Target Users:**
- ✅ SaaS Admins (Super Admin)
- ✅ Company Admins
- ✅ Managers
- ✅ Regular Users
- ✅ Multi-tenant companies

**Key Goals:**
- Enterprise-grade UI/UX
- Mobile responsive + PWA
- Role-based UI (RBAC)
- Multi-company switching
- Complete user management
- Audit trail visualization
- Email activity monitoring

### 1.2 Scope

**✅ In Scope Features:**

| Category | Features |
|----------|----------|
| **Authentication** | Login, Registration with OTP, Forgot Password, Reset Password |
| **User Profile** | Avatar Upload, Change Password, Multi-session Management |
| **Multi-Tenancy** | Company Switcher, Company Dashboard, Company Settings |
| **User Management** | CRUD, Role Assignment, Activate/Deactivate, Activity History |
| **Role & Permissions** | Role Assignment, Permission Matrix, Custom Roles |
| **Dashboard** | Metrics, Activity Stats, Email Status, Health Indicators |
| **Audit Trail** | Change History, Filters, Export Logs |
| **Email Monitor** | Queue Status, Failed Email Retry, Template Preview |

**❌ Out of Scope:**
- Public marketing website
- Blog/CMS features
- Payment integration UI
- Customer support chat
- Mobile native apps (PWA covers this)

---

## 2️⃣ User Roles & Access Control

### 2.1 Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| Super Admin | 1 | Full system access, manage all companies |
| Company Admin | 2 | Full access within company, manage users/roles |
| Manager | 3 | View/edit data, limited user management |
| User | 4 | View own data, basic operations |

### 2.2 UI Visibility Rules

```javascript
// Role-based UI hiding
if (!hasPermission('users.create')) {
  hide('.btn-create-user');
}

if (!hasRole('admin')) {
  hide('.admin-only');
}
```

**Implementation:**
- Frontend checks JWT claims
- Backend validates permissions
- UI elements hidden based on role
- API calls fail gracefully with 403

---

## 3️⃣ Functional Requirements

### 3.1 Authentication Pages

#### 3.1.1 Login Page (`/login.html`)

**Elements:**
- Email input (validated)
- Password input (with show/hide toggle)
- "Remember me" checkbox
- "Forgot Password?" link
- Login button
- "Don't have account? Register" link

**Validations:**
- Email format check
- Password minimum 8 characters
- Backend error handling (401, 422)

**API:**
```
POST /api/v1/auth/login
Request: { email, password }
Response: { access_token, user }
```

#### 3.1.2 Registration Page (`/register.html`)

**Steps:**
1. Enter email, password, name
2. Receive OTP via email
3. Verify OTP
4. Account created

**Elements:**
- Name input
- Email input
- Password input (strength meter)
- Confirm password
- OTP verification modal
- Resend OTP button

**API:**
```
POST /api/v1/auth/register
POST /api/v1/auth/verify-otp
```

#### 3.1.3 Forgot Password (`/forgot-password.html`)

**Flow:**
1. Enter email
2. Receive reset link via email
3. Click link → Reset password page
4. Enter new password
5. Redirect to login

**API:**
```
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

---

### 3.2 Dashboard Pages

#### 3.2.1 Main Dashboard (`/dashboard.html`)

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [Navbar] Select Company ▼  [Avatar] [Logout]    │
├─────────────────────────────────────────────────┤
│ [Sidebar]  │  Main Content                      │
│            │  ┌──────┐ ┌──────┐ ┌──────┐       │
│ Dashboard  │  │Users │ │Active│ │Emails│       │
│ Users      │  │ 234  │ │ 189  │ │ 1.2K │       │
│ Companies  │  └──────┘ └──────┘ └──────┘       │
│ Audit      │  ┌────────────────────────┐       │
│ Emails     │  │ Recent Activity Feed   │       │
│ Profile    │  └────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

**Metrics Cards:**
- Total Users (this company)
- Active Users (online now)
- Total Companies (Super Admin only)
- Failed Emails (last 24h)

**Recent Activity Feed:**
- User login/logout events
- User created/updated
- Role changes
- Last 10 activities

#### 3.2.2 Users Management (`/users.html`)

**Features:**
- Paginated user table (DataTable)
- Search by name/email
- Filter by role/status
- Sort by name/created date
- Bulk actions (activate/deactivate)

**Table Columns:**
| Column | Description |
|--------|-------------|
| Avatar | User profile image |
| Name | Full name |
| Email | Email address |
| Role | Badge (Admin/Manager/User) |
| Status | Active/Inactive toggle |
| Last Login | Timestamp |
| Actions | Edit, Delete, View |

**Actions:**
- ➕ Create User (modal)
- ✏️ Edit User (modal)
- 🗑️ Delete User (confirmation)
- 👁️ View Details (modal with audit trail)
- 🔄 Change Role (dropdown)
- ⚡ Activate/Deactivate toggle

**API:**
```
GET  /api/v1/companies/{id}/users?page=1&limit=20
POST /api/v1/companies/{id}/users
PUT  /api/v1/companies/{id}/users/{user_id}
DELETE /api/v1/companies/{id}/users/{user_id}
```

#### 3.2.3 Companies Management (`/companies.html`)

**Super Admin Only**

**Table Columns:**
- Company Name
- Admin User
- Total Users
- Created Date
- Status
- Actions

**API:**
```
GET  /api/v1/companies
POST /api/v1/companies
PUT  /api/v1/companies/{id}
DELETE /api/v1/companies/{id}
```

#### 3.2.4 Roles & Permissions (`/roles.html`)

**Permission Matrix View:**
```
┌─────────────┬──────┬──────┬────────┬──────┐
│ Resource    │ View │ Edit │ Create │Delete│
├─────────────┼──────┼──────┼────────┼──────┤
│ Users       │  ✅  │  ✅  │   ✅   │  ✅  │ Admin
│ Companies   │  ✅  │  ❌  │   ❌   │  ❌  │ Manager
│ Audit Logs  │  ✅  │  ❌  │   ❌   │  ❌  │ User
└─────────────┴──────┴──────┴────────┴──────┘
```

**API:**
```
GET  /api/v1/permissions
POST /api/v1/permissions
GET  /api/v1/permissions/role/{role}
```

#### 3.2.5 Audit Trail (`/audit.html`)

**Filters:**
- Date Range Picker
- User Filter (dropdown)
- Action Filter (Created, Updated, Deleted)
- Resource Filter (Users, Companies, etc.)

**Table Columns:**
- Timestamp
- User
- Action (badge)
- Resource
- Changes (JSON diff viewer)
- IP Address

**Export:**
- Download as CSV
- Download as JSON

#### 3.2.6 Email Activity (`/emails.html`)

**Queue Status Cards:**
- Pending Queue
- Retry Queue
- DLQ (Failed)
- Sent Today

**Failed Emails Table:**
- Recipient
- Subject
- Error Message
- Retry Count
- Timestamp
- Actions (Retry, View Payload)

#### 3.2.7 Profile Management (`/profile.html`)

**Sections:**

1. **Personal Information:**
   - Avatar (upload/change)
   - Name
   - Email (read-only)
   - Phone (optional)

2. **Security:**
   - Change Password
   - Active Sessions (list devices)

3. **Preferences:**
   - Timezone
   - Email Notifications (toggles)

---

## 4️⃣ Non-Functional Requirements

### 4.1 Performance
| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Page transitions | < 200ms |
| API response | < 500ms |

### 4.2 Security
- JWT stored in localStorage
- CSRF protection
- XSS sanitization
- Input validation (client + server)
- Rate limiting on login/register

### 4.3 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation (Tab, Enter, Esc)
- ARIA labels for screen readers
- Focus indicators
- Color contrast ratio > 4.5:1

### 4.4 Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari/Chrome (iOS 14+, Android 10+)

### 4.5 Responsive Design
| Device | Width |
|--------|-------|
| Mobile | 320px - 768px |
| Tablet | 768px - 1024px |
| Desktop | 1024px+ |

### 4.6 PWA Requirements
- Service Worker (offline caching)
- Manifest.json (installable)
- App icons (192x192, 512x512)
- Offline fallback page

---

## 5️⃣ UI Architecture

### 5.1 Folder Structure

```
/frontend
├── index.html                  # Redirect to login/dashboard
├── login.html
├── register.html
├── forgot-password.html
├── dashboard.html
├── users.html
├── companies.html
├── roles.html
├── audit.html
├── emails.html
├── profile.html
├── /css
│   ├── tokens.css              # Design tokens (colors, spacing)
│   ├── base.css                # Reset + base styles
│   ├── components.css          # Reusable components
│   ├── layout.css              # Grid, sidebar, navbar
│   └── pages.css               # Page-specific styles
├── /js
│   ├── api.js                  # API wrapper (fetch)
│   ├── auth.js                 # JWT handling, RBAC
│   ├── components/
│   │   ├── modal.js
│   │   ├── toast.js
│   │   ├── datatable.js        # Custom DataTable
│   │   └── dropdown.js
│   ├── pages/
│   │   ├── dashboard.js
│   │   ├── users.js
│   │   ├── companies.js
│   │   ├── audit.js
│   │   └── emails.js
│   └── utils.js                # Helpers (formatDate, etc.)
├── /assets
│   ├── logo.svg
│   ├── icons/
│   └── avatars/
├── manifest.json               # PWA manifest
├── sw.js                       # Service Worker
└── /docs
    └── components.html         # Component library docs
```

### 5.2 Design System (Flowbite-like)

#### 5.2.1 Design Tokens

```css
:root {
  /* Colors */
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --success: #16a34a;
  --danger: #dc2626;
  --warning: #f59e0b;
  --info: #0ea5e9;
  
  /* Neutrals */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-500: #6b7280;
  --gray-900: #111827;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  
  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Radius */
  --radius-sm: 4px;
  --radius: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

#### 5.2.2 Core Components

**Button:**
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-danger">Delete</button>
<button class="btn btn-sm">Small</button>
<button class="btn" disabled>Disabled</button>
```

**Card:**
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">Content here</div>
  <div class="card-footer">
    <button class="btn">Action</button>
  </div>
</div>
```

**Table:**
```html
<div class="table-container">
  <table class="table">
    <thead>
      <tr><th>Name</th><th>Email</th><th>Actions</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>john@example.com</td>
        <td><button class="btn btn-sm">Edit</button></td>
      </tr>
    </tbody>
  </table>
</div>
```

**Modal:**
```html
<div class="modal-overlay" id="modal-user">
  <div class="modal">
    <div class="modal-header">
      <h2>Create User</h2>
      <button class="modal-close">&times;</button>
    </div>
    <div class="modal-body">
      <form>...</form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

**Toast:**
```html
<div class="toast toast-success">
  ✅ User created successfully!
</div>
```

**Badge:**
```html
<span class="badge badge-success">Active</span>
<span class="badge badge-danger">Inactive</span>
<span class="badge badge-warning">Pending</span>
```

**Dropdown:**
```html
<div class="dropdown">
  <button class="dropdown-toggle">Select Company ▼</button>
  <div class="dropdown-menu">
    <a href="#" class="dropdown-item">Company A</a>
    <a href="#" class="dropdown-item">Company B</a>
  </div>
</div>
```

**Avatar:**
```html
<img class="avatar avatar-sm" src="user.jpg" alt="User">
<img class="avatar avatar-md" src="user.jpg" alt="User">
<img class="avatar avatar-lg" src="user.jpg" alt="User">
```

**Pagination:**
```html
<div class="pagination">
  <button class="btn btn-sm" disabled>Previous</button>
  <span class="pagination-info">Page 1 of 10</span>
  <button class="btn btn-sm">Next</button>
</div>
```

---

## 6️⃣ JavaScript Architecture

### 6.1 API Layer (`api.js`)

```javascript
const API = {
  baseURL: '/api/v1',
  
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('access_token');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login.html';
      }
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  },
  
  // Auth
  login: (data) => API.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => API.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => API.request('/auth/logout', { method: 'POST' }),
  
  // Users
  getUsers: (companyId, params) => API.request(`/companies/${companyId}/users?${new URLSearchParams(params)}`),
  createUser: (companyId, data) => API.request(`/companies/${companyId}/users`, { method: 'POST', body: JSON.stringify(data) }),
  
  // Companies
  getCompanies: () => API.request('/companies'),
  selectCompany: (id) => API.request(`/companies/select/${id}`, { method: 'POST' })
};
```

### 6.2 Auth & RBAC (`auth.js`)

```javascript
const Auth = {
  getToken() {
    return localStorage.getItem('access_token');
  },
  
  setToken(token) {
    localStorage.setItem('access_token', token);
  },
  
  clearToken() {
    localStorage.removeItem('access_token');
  },
  
  getUser() {
    const token = this.getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  },
  
  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  },
  
  isAuthenticated() {
    return !!this.getToken();
  }
};

// Route guard
if (!Auth.isAuthenticated() && !window.location.pathname.includes('login')) {
  window.location.href = '/login.html';
}
```

### 6.3 Custom DataTable Component

```javascript
class DataTable {
  constructor(selector, options) {
    this.container = document.querySelector(selector);
    this.data = options.data || [];
    this.columns = options.columns || [];
    this.perPage = options.perPage || 10;
    this.currentPage = 1;
    this.searchable = options.searchable || false;
    this.sortable = options.sortable || false;
    this.onRowClick = options.onRowClick || null;
    
    this.init();
  }
  
  init() {
    this.render();
    if (this.searchable) this.addSearch();
  }
  
  render() {
    const start = (this.currentPage - 1) * this.perPage;
    const end = start + this.perPage;
    const pageData = this.filteredData().slice(start, end);
    
    let html = `
      <div class="table-container">
        <table class="table">
          <thead><tr>
            ${this.columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr></thead>
          <tbody>
            ${pageData.map(row => `
              <tr>
                ${this.columns.map(col => `<td>${row[col.key] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${this.renderPagination()}
    `;
    
    this.container.innerHTML = html;
    this.bindEvents();
  }
  
  renderPagination() {
    const totalPages = Math.ceil(this.filteredData().length / this.perPage);
    return `
      <div class="pagination">
        <button class="btn btn-sm" ${this.currentPage === 1 ? 'disabled' : ''} data-action="prev">Previous</button>
        <span class="pagination-info">Page ${this.currentPage} of ${totalPages}</span>
        <button class="btn btn-sm" ${this.currentPage === totalPages ? 'disabled' : ''} data-action="next">Next</button>
      </div>
    `;
  }
  
  filteredData() {
    if (!this.searchTerm) return this.data;
    return this.data.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );
  }
  
  setData(data) {
    this.data = data;
    this.currentPage = 1;
    this.render();
  }
  
  bindEvents() {
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action === 'prev') this.prevPage();
        if (action === 'next') this.nextPage();
      });
    });
  }
  
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
    }
  }
  
  nextPage() {
    const totalPages = Math.ceil(this.filteredData().length / this.perPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.render();
    }
  }
  
  search(term) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.render();
  }
}
```

---

## 7️⃣ Workflows & UX Flows

### 7.1 User Registration Flow
```
1. User visits /register.html
2. Fills form (name, email, password)
3. Clicks "Register"
4. → API: POST /auth/register
5. ← Response: { message: "OTP sent to email" }
6. Modal opens: "Enter OTP"
7. User enters OTP
8. → API: POST /auth/verify-otp
9. ← Success: redirect to /dashboard.html
10. Toast: "Welcome! Account created ✅"
```

### 7.2 User Management Flow (Admin)
```
1. Admin → /users.html
2. Clicks "➕ Create User"
3. Modal opens
4. Fills: name, email, role
5. Clicks "Create"
6. → API: POST /companies/{id}/users
7. ← Success
8. Table refreshes
9. Toast: "User created successfully! ✅"
```

### 7.3 Company Switching Flow
```
1. User clicks "Select Company ▼" (navbar)
2. Dropdown shows all companies
3. User selects "Company B"
4. → API: POST /companies/select/{id}
5. ← Success
6. localStorage.setItem('active_company', id)
7. Dashboard reloads with Company B data
8. Toast: "Switched to Company B ✅"
```

---

## 8️⃣ Responsive Design

```css
/* Mobile First */
@media (max-width: 640px) {
  /* Stacked layout, hamburger menu */
  .sidebar { transform: translateX(-100%); }
  .main-content { margin-left: 0; }
}

@media (min-width: 641px) and (max-width: 1024px) {
  /* Tablet: collapsible sidebar */
}

@media (min-width: 1025px) {
  /* Desktop: full sidebar, multi-column */
}
```

**Key Adjustments:**
- Sidebar → Hamburger menu (mobile)
- Tables → Horizontal scroll (mobile)
- Cards → Single column (mobile)
- Modals → Full screen (mobile)
- Buttons → Full width (mobile)

---

## 9️⃣ PWA Configuration

### 9.1 manifest.json
```json
{
  "name": "Application Starter Kit",
  "short_name": "AppKit",
  "description": "Enterprise SaaS Admin Dashboard",
  "start_url": "/dashboard.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 9.2 Service Worker
```javascript
const CACHE_NAME = 'appkit-v1';
const urlsToCache = ['/', '/css/base.css', '/js/api.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
```

---

## 🔟 Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error shown)
- [ ] Registration with OTP verification
- [ ] Forgot password flow
- [ ] Logout clears session

### User Management
- [ ] Create user (with/without avatar)
- [ ] Edit user
- [ ] Delete user (confirmation modal)
- [ ] Change user role
- [ ] Activate/deactivate user

### Company Switching
- [ ] Switch between companies
- [ ] Data isolated per company
- [ ] Permissions respected

### Responsive
- [ ] Mobile (< 768px): hamburger menu works
- [ ] Tablet (768-1024px): collapsible sidebar
- [ ] Desktop (> 1024px): full layout

### PWA
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Offline fallback works

---

## 1️⃣1️⃣ Implementation Priority

| Priority | Page | Complexity |
|----------|------|------------|
| 1 | Login/Register | Medium |
| 2 | Dashboard | Medium |
| 3 | Users Management | High |
| 4 | Profile | Low |
| 5 | Companies | Medium |
| 6 | Audit Trail | Medium |
| 7 | Emails | Low |
| 8 | Roles & Permissions | High |

---

## 1️⃣2️⃣ Future Enhancements

- [ ] Dark mode toggle
- [ ] Multi-language (i18n)
- [ ] Advanced charts (Chart.js)
- [ ] Real-time notifications (WebSocket)
- [ ] Bulk user import (CSV)
- [ ] Export data (CSV, PDF)
- [ ] Keyboard shortcuts (Cmd+K)

---

## 📌 Summary

**Key Highlights:**
- ✅ Complete feature specification
- ✅ Flowbite-style design system
- ✅ Mobile responsive + PWA
- ✅ Role-based access control
- ✅ Multi-tenancy support
- ✅ Pure HTML/CSS/JS (no frameworks)
- ✅ FastAPI integration ready
- ✅ Custom DataTable component

**Version:** 2.0  
**Status:** ✅ Ready for Implementation  
**Next Step:** Start coding! 🚀
