# Implementation Plan - Mini ERP + CRM Operations Portal

Build a full-stack monorepo application (**Mini ERP + CRM Operations Portal**) for a wholesale/distribution business featuring role-based authentication, Customer CRM management with follow-ups, Product Inventory with stock movement audit logs, and a Sales Challan flow with stock deduction guardrails.

---

## 1. Requirements Summary & PDF Extraction Analysis

### Business Domain
Wholesale / distribution operations managing Customers (leads, active, inactive), Product Catalog & Stock, Inventory Movements (IN/OUT logs), and Sales Challans (Draft/Confirmed/Cancelled) with auto stock reduction.

### Roles & Permissions
- **Admin**: Full access across all modules (Users, Customers, Inventory, Challans, Audit Logs).
- **Sales**: Customer CRM (create, edit, follow-up) & Sales Challan creation/confirmation.
- **Warehouse**: Inventory & Product stock updates, view stock movement logs.
- **Accounts**: View Challans, Customer invoicing status, and reports.

### Data Schemas & Business Rules
1. **User / Auth**:
   - `id`, `name`, `email`, `password_hash`, `role` (`Admin`, `Sales`, `Warehouse`, `Accounts`), `created_at`
2. **Customer CRM**:
   - `id`, `name`, `mobile`, `email`, `business_name`, `gst_number` (optional), `customer_type` (`Retail`, `Wholesale`, `Distributor`), `address`, `status` (`Lead`, `Active`, `Inactive`), `follow_up_date`, `notes`, `created_at`, `updated_at`
   - Sub-entity **Customer Follow-Up Note**: `id`, `customer_id`, `note`, `follow_up_date`, `created_by`, `created_at`
3. **Product & Inventory**:
   - `id`, `name`, `sku`, `category`, `unit_price`, `current_stock`, `min_stock_alert`, `location`, `created_at`, `updated_at`
   - Sub-entity **Stock Movement Log**: `id`, `product_id`, `quantity_changed`, `movement_type` (`IN`, `OUT`), `reason`, `created_by`, `timestamp`
4. **Sales Challan**:
   - `id`, `challan_number` (auto-generated format: e.g. `CH-202608-0001`), `customer_id`, `customer_snapshot` (JSON: customer details at time of issue), `total_quantity`, `status` (`Draft`, `Confirmed`, `Cancelled`), `created_by`, `created_at`, `updated_at`
   - Sub-entity **Challan Line Item**: `id`, `challan_id`, `product_id`, `product_snapshot` (JSON: name, SKU, price snapshot), `quantity`, `unit_price`
   - **Critical Rule**: When a Challan status changes to `Confirmed`:
     - Validate stock availability for all line items.
     - If stock < requested quantity, reject transaction with `400 Bad Request` ("Insufficient stock for SKU [code]").
     - Atomically deduct stock from `products` table and log a `Movement OUT` record for each item.
     - Stock can NEVER drop below 0.

---

## 2. Proposed Architecture & Stack

```
Fundsroom/
├── server/                   # Backend Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/           # Database & env configuration
│   │   ├── controllers/      # Auth, Customer, Product, Challan controllers
│   │   ├── middleware/       # JWT auth & Role-Based Access Control (RBAC), error handler, validation
│   │   ├── models/           # Prisma / SQL queries & TypeScript interfaces
│   │   ├── routes/           # RESTful API endpoints
│   │   ├── utils/            # Auto-generators, validators, helpers
│   │   └── app.ts            # Express app bootstrap
│   ├── package.json
│   └── tsconfig.json
├── client/                   # Frontend React + TypeScript (Vite)
│   ├── src/
│   │   ├── assets/           # Design system icons & assets
│   │   ├── components/       # Layout, Navbar, Cards, Modals, DataTables
│   │   ├── context/          # Auth Context & Notification State
│   │   ├── pages/            # Login, Dashboard, Customers, Inventory, Challans
│   │   ├── services/         # Axios/Fetch API client layer
│   │   ├── styles/           # Design tokens matching DESIGN.md (Cream canvas, feature card accents)
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── .env.example
└── README.md                 # Setup, seed commands, API docs, deployment instructions
```

---

## 3. User Review Required

> [!IMPORTANT]
> **Database Option**: We will use **SQLite (with Prisma ORM)** for zero-friction local development, which can seamlessly target **PostgreSQL** or **MySQL** via `.env` `DATABASE_URL` for production/AWS deployment.

> [!NOTE]
> **Bonus Features Omitted (As Requested)**: Docker setup, GitHub Actions CI/CD pipeline, PDF invoice generator, and AWS S3 image uploads are deliberately excluded per your instruction and will be introduced in a future phase.

---

## 4. Proposed Implementation Steps

### Phase 1: Project Setup & Monorepo Configuration
1. Initialize `server/` with Node.js, Express, TypeScript, Prisma/Database driver, CORS, bcryptjs, jsonwebtoken, and express-validator.
2. Initialize `client/` with Vite + React + TypeScript.
3. Configure `package.json` root scripts for concurrent execution (`npm run dev`).

### Phase 2: Backend Database Schema & RESTful APIs
1. Define Prisma / SQL schema for `Users`, `Customers`, `FollowUpNotes`, `Products`, `StockLogs`, `Challans`, `ChallanItems`.
2. Seed script with sample data:
   - Admin user (`admin@fundsroom.com`), Sales user (`sales@fundsroom.com`), Warehouse user (`warehouse@fundsroom.com`), Accounts user (`accounts@fundsroom.com`).
   - Sample customers, products with initial stock, and draft challans.
3. Implement API Endpoints:
   - **Auth**: `POST /api/auth/login`, `GET /api/auth/me`
   - **Customers**: `GET /api/customers`, `POST /api/customers`, `GET /api/customers/:id`, `PUT /api/customers/:id`, `POST /api/customers/:id/notes`
   - **Products**: `GET /api/products`, `POST /api/products`, `PUT /api/products/:id`, `GET /api/products/:id/stock-logs`
   - **Sales Challans**: `GET /api/challans`, `POST /api/challans`, `GET /api/challans/:id`, `PATCH /api/challans/:id/status` (handles Confirmation stock transaction & guardrails)

### Phase 3: Frontend Admin Dashboard (Clay-inspired Design System)
1. Build Layout with Responsive Navigation matching `DESIGN.md` (Cream Canvas `{colors.canvas}`, primary dark buttons, clean typography).
2. Implement **Auth Flow**: Login page, JWT token management, Role-gated route protection.
3. Implement **Customer CRM Module**:
   - Data Table with search/filter (by Type, Status, Name).
   - Add/Edit Customer Drawer / Modal.
   - Detail View with Timeline of Follow-up Notes & quick add note form.
4. Implement **Product & Inventory Module**:
   - Stock Overview Grid with Low Stock Alert indicators (`current_stock <= min_stock_alert`).
   - Add/Edit Product Modal.
   - Stock Movement History drawer showing IN/OUT audit trail.
5. Implement **Sales Challan Module**:
   - Multi-step / interactive Challan Creator (Customer selector, item search + quantity inputs, auto-calculated total).
   - Challan List with status badges (`Draft`, `Confirmed`, `Cancelled`).
   - Challan Detail View showing customer snapshot & line item snapshot.
   - **Confirm Action Button**: triggers confirmation API call with instant feedback.

### Phase 4: Documentation & Verification
1. Create `README.md` with step-by-step local setup, environment variables guide, API endpoints, role credentials table, and AWS deployment instructions.
2. Verify all API validation, HTTP status codes, role authorization, and stock guardrails.

---

## 5. Verification Plan

### Automated & API Tests
- Execute seed script and verify database integrity.
- Test authentication with all 4 user roles (`Admin`, `Sales`, `Warehouse`, `Accounts`).
- Verify stock guardrail API response when confirming a challan with quantity > available stock (`400 Bad Request`).

### Manual Functional Verification
- Log in as Sales user -> Add customer -> Add follow-up note -> Create Draft Challan.
- Log in as Warehouse user -> Confirm Challan -> Verify stock count auto-decremented & IN/OUT movement log created.
- Verify low stock visual alert badge triggers when stock drops below threshold.
