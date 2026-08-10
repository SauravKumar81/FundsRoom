# Fundsroom - Mini ERP + CRM Operations Portal

A full-stack monorepo application for wholesale/distribution businesses featuring role-based authentication, Customer CRM management, Product Inventory with stock movement audit logs, and a Sales Challan flow with stock deduction guardrails.

## Tech Stack

- **Backend:** Node.js + Express + TypeScript + Prisma ORM + SQLite
- **Frontend:** React 19 + TypeScript + Vite + Axios + Lucide Icons
- **Auth:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Database:** SQLite (easily swappable to PostgreSQL via `.env`)

## Quick Start

### Prerequisites

- Node.js 18+ and npm installed

### 1. Install Dependencies

```bash
# From root
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Set Up Environment

```bash
# Copy the example env file
cp .env.example server/.env
```

### 3. Initialize Database & Seed Data

```bash
cd server

# Run Prisma migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run seed
```

### 4. Start Development Servers

```bash
# From root (runs both server and client concurrently)
npm run dev
```

Or start them separately:

```bash
# Backend (port 5000)
cd server && npm run dev

# Frontend (port 5173)
cd client && npm run dev
```

### 5. Open the App

Navigate to `http://localhost:5173` in your browser.

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fundsroom.com | Password123! |
| Sales | sales@fundsroom.com | Password123! |
| Warehouse | warehouse@fundsroom.com | Password123! |
| Accounts | accounts@fundsroom.com | Password123! |

---

## Role-Based Permissions

| Module | Admin | Sales | Warehouse | Accounts |
|--------|:-----:|:-----:|:---------:|:--------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Customers (View) | ✅ | ✅ | ✅ | ✅ |
| Customers (Create/Edit) | ✅ | ✅ | ❌ | ❌ |
| Products (View) | ✅ | ✅ | ✅ | ✅ |
| Products (Create/Edit) | ✅ | ✅ | ✅ | ❌ |
| Stock Adjustment | ✅ | ❌ | ✅ | ❌ |
| Challans (View) | ✅ | ✅ | ✅ | ✅ |
| Challans (Create) | ✅ | ✅ | ❌ | ❌ |
| Challans (Confirm/Cancel) | ✅ | ✅ | ✅ | ❌ |
| Stock Audit Logs | ✅ | ✅ | ✅ | ✅ |

---

## API Endpoints

### Auth
- `POST /api/auth/login` — Login with email/password, returns JWT
- `GET /api/auth/me` — Get current authenticated user
- `GET /api/auth/users` — List all users (Admin only)

### Customers
- `GET /api/customers` — List customers (paginated, filterable)
- `GET /api/customers/:id` — Get customer with follow-ups and challans
- `POST /api/customers` — Create customer (Admin/Sales)
- `PUT /api/customers/:id` — Update customer (Admin/Sales)
- `POST /api/customers/:id/notes` — Add follow-up note (Admin/Sales)

### Products
- `GET /api/products` — List products (paginated, filterable)
- `GET /api/products/:id` — Get product with stock movement logs
- `POST /api/products` — Create product (Admin/Warehouse/Sales)
- `PUT /api/products/:id` — Update product (Admin/Warehouse/Sales)
- `POST /api/products/:id/stock` — Adjust stock IN/OUT (Admin/Warehouse)
- `GET /api/products/logs/all` — Get all stock movement logs

### Sales Challans
- `GET /api/challans` — List challans (paginated, filterable)
- `GET /api/challans/:id` — Get challan with line items
- `POST /api/challans` — Create new challan (Admin/Sales)
- `PATCH /api/challans/:id/status` — Confirm or Cancel challan (Admin/Sales/Warehouse)

---

## Key Business Rules

### Stock Guardrails
- Stock can **never** drop below 0
- When a Challan is **Confirmed**, stock is atomically deducted for all line items
- If stock is insufficient for any item, the confirmation is rejected with `400 Bad Request`
- When a Confirmed Challan is **Cancelled**, stock is restored for all line items

### Challan Auto-Generation
- Challan numbers are auto-generated in format: `CH-YYYYMM-NNNN` (e.g., `CH-202608-0001`)

### Customer Snapshots
- Customer name, email, and mobile are captured at challan creation time

---

## Project Structure

```
Fundsroom/
├── server/                   # Express + TypeScript + Prisma backend
│   ├── prisma/               # Schema and migrations
│   ├── src/
│   │   ├── config/           # Prisma client singleton
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/        # Auth (JWT + RBAC), error handler
│   │   ├── routes/           # Express route definitions
│   │   └── app.ts            # Express bootstrap
│   └── package.json
├── client/                   # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/       # Layout, Navbar, Sidebar, Modals
│   │   ├── context/          # AuthContext
│   │   ├── pages/            # Dashboard, Customers, Products, Challans, Logs
│   │   ├── services/         # Axios API client
│   │   ├── types.ts          # TypeScript interfaces
│   │   └── index.css         # Design system (Clay-inspired)
│   └── package.json
├── .env.example
├── package.json              # Root scripts (concurrent dev)
└── README.md
```

---

## Design System

The UI follows a **Clay-inspired** design system with:
- Cream canvas (`#fffaf0`) background
- Saturated feature cards: Pink, Teal, Lavender, Peach
- Dark navy primary buttons
- Rounded corners (12px-24px)
- Inter font family

---

## License

Private - For educational/portfolio use.
