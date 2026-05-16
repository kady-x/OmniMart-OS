# OmniMart OS (Supermarket Management SaaS)

A highly scalable, production-ready full-stack Supermarket Management System designed for modern retail environments. Built with a robust **Node.js/Express** backend, **Prisma ORM** for MySQL database interactions, and a custom **Vanilla JS/CSS** premium frontend architecture.

## 🌟 Key Features

### 1. Role-Based Access Control (RBAC)
The system is divided into four strictly isolated portals:
- **Customer Storefront:** A beautiful e-commerce interface where customers can browse featured products, add items to a dynamic sliding cart, and submit orders for in-store checkout. Includes personal order history tracking.
- **Cashier POS Terminal:** A high-speed, iPad-styled Point-of-Sale interface. Cashiers can scan barcodes, sync pending online orders, and print simulated thermal receipts upon secure checkout.
- **Manager Dashboard:** An enterprise analytics control center. Features real-time Chart.js revenue visualizations, deep inventory CRUD controls, dynamic staff management, and active promotion systems.
- **Supplier Portal:** A streamlined procurement tool for vendors to log incoming inventory invoices, which securely auto-updates the system's stock levels.

### 2. Premium Design System
- **Glassmorphism & Dark Mode:** Built entirely from scratch using a bespoke CSS token system (`var(--bg-surface)`, etc.).
- **Responsive Grid:** Flexbox and CSS Grids ensure seamless operation on both ultra-wide monitors and tablet POS devices.
- **Micro-Interactions:** Custom Toast notifications, sliding drawers, and animated modals simulate a Single Page Application (SPA) natively.

### 3. Backend Architecture
- **JWT Authentication:** Stateless, encrypted session handling using `bcrypt` and JSON Web Tokens.
- **SQLite Database:** Switched to SQLite for **Zero-Config Deployment**. No external database server is required, making the project perfectly portable for evaluations.
- **Prisma ORM:** High-performance database abstraction for clean, type-safe queries.

---

## 🚀 Deployment Guide (For Bonus Marks)

This project is optimized for **Render.com** (Free Hosting).

### 1. GitHub Repository
1. Create a **Public** repository on your GitHub: `https://github.com/kady-x/OmniMart-OS.git`
2. Link your local code:
   ```bash
   git remote add origin https://github.com/kady-x/OmniMart-OS.git
   git branch -M main
   git push -u origin main
   ```

### 2. Deploy on Render
1. Go to [Render.com](https://render.com) and log in.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Environment:** `Docker`
   - **Plan:** `Free`
5. **Environment Variables:**
   - `JWT_SECRET`: `any_random_string`
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**. Render will use the `Dockerfile` to build and launch your site!

### 3. Demo Video
Highlight these features in your video:
- **Responsive Storefront:** Search and filter logic.
- **Cashier POS:** Barcode lookup and receipt printing.
- **Manager Dash:** Revenue charts (Chart.js) and Export to CSV.
- **Security:** Show the login/logout flow.

---

## 🔑 Demo Credentials

Use these accounts to explore the different SaaS modules:

| Role       | Username   | Password | Access Portal                 |
|------------|------------|----------|-------------------------------|
| **Manager**| `manager`  | `admin`  | Analytics, Inventory, Staff   |
| **Cashier**| `cashier`  | `cash`   | POS Terminal, Receipts        |
| **Customer**| `customer` | `cust`   | Storefront, Order History     |
| **Supplier**| `supplier` | `supply` | Procurement & Restocking      |

---

## 🛠 Tech Stack

- **Frontend:** Vanilla HTML5, CSS3 (Custom Design System), Vanilla ES6 JavaScript, FontAwesome, Chart.js
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MySQL, Prisma ORM
- **Security:** bcrypt, jsonwebtoken, Express Middlewares
