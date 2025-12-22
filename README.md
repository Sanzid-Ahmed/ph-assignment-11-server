# AssetVerse (Server Side)
### Corporate Asset Management System – Backend API

🔗 **Client Live URL:** https://assetverse-119d3.web.app 
🌐 **Server Deployment:** Vercel

---

## 📌 Project Purpose

The **AssetVerse Server** is the backend REST API that powers the AssetVerse Corporate Asset Management System.  
It handles authentication, authorization, business logic, asset tracking, employee affiliation, package enforcement, analytics data, and Stripe payment processing.

This server is built following **secure, scalable, and production-ready** backend practices.

---

## 🚀 Core Responsibilities

- User authentication & role-based authorization
- HR & Employee business logic enforcement
- Asset inventory & assignment tracking
- Employee auto-affiliation system
- Package limit enforcement
- Stripe payment integration
- Analytics data APIs
- Secure database operations
- Server-side pagination

---

## 🧩 Tech Stack

- Node.js
- Express.js
- MongoDB (Native Driver)
- JSON Web Token (JWT)
- Stripe
- dotenv
- cors

---

## 🔐 Authentication & Authorization

### Authentication
- JWT generated on login
- Token sent from client via `Authorization` header
- Token verified on protected routes

### Middleware
- `verifyToken` → verifies JWT
- `verifyHR` → restricts HR-only routes
- `verifyEmployee` → employee-access routes

### Role-Based Access
| Role | Access |
|----|------|
| HR | Asset management, approvals, employees, payments |
| Employee | Asset requests, personal assets, profile |

