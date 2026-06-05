# SiteFlow CDO — Role Activity & Hosting Cost Analysis

**Generated:** 2026-03-06
**Application:** SiteFlow CDO (Commerce Digital Operations)
**Tech Stack:** React + Vite + Axios | Backend: REST API (Spring Boot)

---

## Table of Contents

1. [Active Roles & Responsibilities](#1-active-roles--responsibilities)
2. [Photo Uploads Per Role](#2-photo-uploads-per-role)
3. [Complete API Endpoint Catalog](#3-complete-api-endpoint-catalog)
4. [API Calls Per Role (Daily Estimates)](#4-api-calls-per-role-daily-estimates)
5. [Daily Traffic Summary](#5-daily-traffic-summary)
6. [Invoice Approval Workflow](#6-invoice-approval-workflow)
7. [Outlet Onboarding Lifecycle](#7-outlet-onboarding-lifecycle)
8. [Key Observations for Hosting Cost](#8-key-observations-for-hosting-cost)
9. [Role Access Matrix](#9-role-access-matrix)

---

## 1. Active Roles & Responsibilities

### SUPER_ADMIN / ADMIN
- **Function:** Full platform administration
- **Write Actions:** Create businesses, users, distributors, slabs. Approve invoices, run payouts, mark paid.
- **View Access:** Everything
- **Menu:** Dashboard, Businesses, Outlets, Users, Distributors, Slabs, Payouts, Reports

### BUSINESS_ADMIN
- **Function:** Business operations lead (CDO Program)
- **Write Actions:** Create distributors, create field users (BUSINESS_USER, FINANCE_ADMIN, RBL, SM, ASM, ASE)
- **View Access:** Outlets, slabs, invoice pipeline, disbursements
- **Menu:** Dashboard, Outlets, Distributors, Slabs, Users

### FINANCE_ADMIN
- **Function:** Invoice & payout processing
- **Write Actions:** Approve/reject invoices (ASM_APPROVED -> FINANCE_APPROVED), run payout cycles, mark payouts as paid (with Transaction ID capture)
- **View Access:** Outlets, distributors, slabs, finance dashboard KPIs
- **Menu:** Dashboard, Outlets, Distributors, Slabs, Users, Payouts

### RBL (Regional Business Leader)
- **Function:** Regional oversight
- **Write Actions:** None (read-only)
- **View Access:** Outlets in region, team hierarchy (ASMs, ASEs), distributors, slabs
- **Special Feature:** Team Hierarchy Widget on Dashboard
- **Menu:** Dashboard, Outlets, Distributors, Slabs, Team Members

### SM (Sales Manager)
- **Function:** Territory management
- **Write Actions:** None (read-only)
- **View Access:** Outlets in territory, team hierarchy, distributors, slabs
- **Special Feature:** Team Hierarchy Widget on Dashboard
- **Menu:** Dashboard, Outlets, Distributors, Slabs, Team Members

### ASM (Area Sales Manager)
- **Function:** Area management + compliance verification
- **Write Actions:** Verifies compliance photos (marks as verified with timestamp)
- **View Access:** Outlets in area, team hierarchy
- **Menu:** Dashboard, Outlets, Distributors, Slabs, Team Members

### ASE (Area Sales Executive)
- **Function:** Field execution (highest activity role)
- **Write Actions:** Creates outlets, uploads onboarding photos (5), uploads verification photos (5), submits invoices with photos
- **View Access:** Own outlets
- **Menu:** Dashboard, Outlets, Distributors, Slabs

### BUSINESS_USER
- **Function:** Field manager (read-only)
- **Write Actions:** None
- **View Access:** Outlets, distributors, slabs
- **Menu:** Dashboard, Outlets, Distributors, Slabs, Users

### Not Yet Implemented (Defined in Enum Only)
- **TRADE_MARKETING** — Future marketing campaign role
- **CSO** (Customer Service Officer) — Future support role
- **SALES_EXECUTIVE** — Future sales team role
- **OUTLET** — Retail outlet accounts (mobile app)
- **FINANCE** — Superseded by FINANCE_ADMIN

---

## 2. Photo Uploads Per Role

### Per-Action Photo Counts

| Role | Photo Type | Photos Per Action | One-Time vs Recurring |
|------|-----------|:-----------------:|----------------------|
| **ASE** | Onboarding Photos (OUTSIDE_VIEW, INSIDE_VIEW, COOLER_SPACE, SHELF_VISIBILITY, BRANDING_OPPORTUNITY) | **5** | One-time (during enrollment) |
| **ASE** | Verification Photos (COOLER_INSTALLED, BRANDING_INSTALLED, PRIME_PLACEMENT, COMPETITION_AREA, SHELF_VISIBILITY) | **5** | One-time (after cooler install) |
| **ASE / Outlet** | Invoice Photo (receipt/bill image) | **1** | Monthly recurring |
| **Outlet Owner** | PFP Agreement Docs (declaration + bank proof) | **1-2** | One-time |
| **ASM** | None (verifier only — reviews ASE photos) | **0** | — |
| **All Others** | None | **0** | — |

### Per-Outlet Lifecycle Photo Total

| Phase | Photos | Frequency |
|-------|:------:|-----------|
| Onboarding (Phase 1) | 5 | One-time |
| PFP Documents | 2 | One-time |
| Verification (Phase 2) | 5 | One-time |
| Invoice uploads | 1/month | Recurring |
| **Total Year 1** | **12 + 12 = 24** | — |
| **Total Year 2+** | **12/year** | Invoice photos only |

### Photo Upload Technical Details

- **File formats accepted:** `image/*`, `.pdf` (for invoices)
- **No client-side compression** detected in codebase
- **Assumed average file size:** ~500KB per photo
- **Storage:** S3/CDN (photos referenced via `photoUrl` / `imageUrl` fields)
- **Geo-tagging:** Required for onboarding & verification photos
- **No batch upload** — each photo uploaded individually

---

## 3. Complete API Endpoint Catalog

### Authentication Module (`/auth/`)

| Method | Endpoint | Trigger | Payload | Paginated |
|--------|----------|---------|---------|:---------:|
| POST | `/auth/login/email` | Admin login (email + password) | Small | No |
| POST | `/auth/login/otp/request` | OTP login initiation (phone) | Small | No |
| POST | `/auth/login/otp/verify` | OTP verification (phone + code) | Small | No |
| POST | `/auth/refresh` | Auto on 401 (token refresh) | Small | No |

### Business Module (`/business`)

| Method | Endpoint | Trigger | Payload | Paginated |
|--------|----------|---------|---------|:---------:|
| POST | `/business` | Create new business | Small | No |
| GET | `/business?page={p}&size={s}` | Page load, pagination, dropdowns | — | Yes (20/page) |

### User Module (`/users`)

| Method | Endpoint | Trigger | Payload | Paginated |
|--------|----------|---------|---------|:---------:|
| POST | `/users` | Create new user | Small | No |
| GET | `/users?page={p}&size={s}` | Page load, pagination, parent user lookup | — | Yes (20/page, 500 for parent lookup) |

### Distributor Module (`/distributors`)

| Method | Endpoint | Trigger | Payload | Paginated |
|--------|----------|---------|---------|:---------:|
| POST | `/distributors` | Create new distributor | Small | No |
| GET | `/distributors?page={p}&size={s}` | Page load, pagination | — | Yes (20/page) |

### Location Module (`/locations`)

| Method | Endpoint | Trigger | Payload | Paginated |
|--------|----------|---------|---------|:---------:|
| GET | `/locations` | Form initialization (dropdowns) | — | No (full list) |

### Outlet Module (`/outlets`)

| Method | Endpoint | Trigger | Payload | Paginated |
|--------|----------|---------|---------|:---------:|
| GET | `/outlets?page={p}&size={s}` | Page load, pagination | — | Yes (20/page, 200 in Payouts) |

### Slab Module (`/slabs`)

| Method | Endpoint | Trigger | Payload | Paginated |
|--------|----------|---------|---------|:---------:|
| GET | `/slabs?page={p}&size={s}` | Page load, pagination | — | Yes (20/page) |

### Invoice Module (`/invoices`)

| Method | Endpoint | Trigger | Payload | Paginated |
|--------|----------|---------|---------|:---------:|
| GET | `/invoices?page={p}&size={s}` | Page load, pagination | — | Yes (50-100/page) |
| GET | `/invoices?outletId={id}&page={p}&size={s}` | Outlet detail view | — | Yes (50-100/page) |
| POST | `/invoices/{id}/approve` | Finance approval | Small (remarks) | No |
| POST | `/invoices/{id}/reject` | Finance rejection | Small (remarks) | No |

### Payout Module (`/payouts`)

| Method | Endpoint | Trigger | Payload | Paginated |
|--------|----------|---------|---------|:---------:|
| GET | `/payouts?page={p}&size={s}` | Page load, pagination | — | Yes (10-50/page) |
| GET | `/payouts/{id}` | Individual payout detail | — | No |
| POST | `/payouts/run-cycle` | Manual payout cycle trigger | Empty | No |
| POST | `/payouts/{id}/mark-paid` | Mark payout as settled | Empty | No |

### Hierarchy Module (`/hierarchy`)

| Method | Endpoint | Trigger | Payload | Paginated |
|--------|----------|---------|---------|:---------:|
| GET | `/hierarchy` | Dashboard load (RBL/SM roles) | — | No |

**Total unique endpoints: 19**

---

## 4. API Calls Per Role (Daily Estimates)

### ADMIN / SUPER_ADMIN (1-2 users, low frequency)

| Action | API Calls | Frequency |
|--------|:---------:|-----------|
| Dashboard load | 5 (business + users + outlets + invoices + payouts) | ~5x/day |
| Create business | 1 | ~1/week |
| Create user | 4 (locations + business + users lookup + POST) | ~2-3/week |
| Create distributor | 3 (locations + business + POST) | ~1-2/week |
| Browse lists (pagination) | 1 per page | ~10 pages/day |
| **Daily estimate per user** | **~30-40** | |

### BUSINESS_ADMIN (2-5 users)

| Action | API Calls | Frequency |
|--------|:---------:|-----------|
| Dashboard load | 3 (outlets + invoices + payouts) | ~5x/day |
| Create distributor | 3 | ~1/week |
| Create field user | 4 | ~2/week |
| Browse lists | 1 per page | ~10 pages/day |
| **Daily estimate per user** | **~20-30** | |

### FINANCE_ADMIN (2-3 users, highest per-user activity)

| Action | API Calls | Frequency |
|--------|:---------:|-----------|
| Dashboard load | 3 (invoices 100 items + payouts 50 items + outlets) | ~5-10x/day |
| Review invoices (pagination) | 1 per page | ~20 pages/day |
| Approve/reject invoices | 1 per action | ~20-50/day |
| Run payout cycle | 1 | ~1-2/week |
| Mark payouts paid | 1 per payout | ~10-20/day |
| **Daily estimate per user** | **~60-100** | |

### RBL / SM (5-10 users, mostly view)

| Action | API Calls | Frequency |
|--------|:---------:|-----------|
| Dashboard load | 3 (outlets + invoices + hierarchy) | ~3-5x/day |
| Browse outlets | 1 per page | ~5 pages/day |
| **Daily estimate per user** | **~15-25** | |

### ASM (10-20 users)

| Action | API Calls | Frequency |
|--------|:---------:|-----------|
| Dashboard load | 2 (outlets + invoices) | ~3-5x/day |
| Browse outlets | 1 per page | ~5 pages/day |
| View outlet detail | 1 (invoices by outlet) | ~5/day |
| **Daily estimate per user** | **~15-25** | |

### ASE (50-200 users, highest total volume)

| Action | API Calls | Frequency |
|--------|:---------:|-----------|
| Dashboard load | 2 (outlets + invoices) | ~3-5x/day |
| Browse outlets | 1 per page | ~3 pages/day |
| View outlet detail | 1 (invoices by outlet) | ~5-10/day |
| **Daily estimate per user** | **~15-20** | |

---

## 5. Daily Traffic Summary

### Scenario: Typical Deployment (~138 users)

| Role | Est. Users | API Calls/User/Day | Total API Calls/Day | Photo Uploads/Day |
|------|:----------:|:------------------:|:-------------------:|:-----------------:|
| ADMIN / SUPER_ADMIN | 2 | 35 | 70 | 0 |
| BUSINESS_ADMIN | 3 | 25 | 75 | 0 |
| FINANCE_ADMIN | 3 | 80 | 240 | 0 |
| RBL | 5 | 20 | 100 | 0 |
| SM | 10 | 20 | 200 | 0 |
| ASM | 15 | 20 | 300 | 0 |
| ASE | 100 | 18 | 1,800 | ~50 |
| **TOTAL** | **~138** | — | **~2,785** | **~50** |

### Scaled Scenarios

| Scale | Users | API Calls/Day | Photos/Day | Photo Storage/Day | Photo Storage/Month |
|-------|:-----:|:------------:|:----------:|:-----------------:|:-------------------:|
| Small (1 business) | ~50 | ~1,000 | ~15 | ~7.5 MB | ~225 MB |
| Medium (3 businesses) | ~138 | ~2,800 | ~50 | ~25 MB | ~750 MB |
| Large (10 businesses) | ~500 | ~10,000 | ~150 | ~75 MB | ~2.25 GB |
| Enterprise (50 businesses) | ~2,500 | ~50,000 | ~750 | ~375 MB | ~11.25 GB |

*Photo storage assumes ~500KB average per uncompressed photo.*

---

## 6. Invoice Approval Workflow

```
ASE Submits Invoice (with photo)
        |
        v
  Status: SUBMITTED
        |
        v
ASM Reviews & Approves
        |
        v
  Status: ASM_APPROVED
        |
        v
FINANCE_ADMIN Reviews
   /           \
  v             v
APPROVE       REJECT
  |             |
  v             v
FINANCE_     Status:
APPROVED     REJECTED
  |
  v
Run Payout Cycle (FINANCE_ADMIN)
  |
  v
Status: CALCULATED (PayoutResult created)
  |
  v
Mark as Paid (FINANCE_ADMIN enters Transaction ID)
  |
  v
Status: PAID
```

**API calls per invoice lifecycle:** 4-5 calls (submit + approve + approve + run cycle + mark paid)

---

## 7. Outlet Onboarding Lifecycle

```
Phase 1: Enrollment (Days 0-7)
├── Step 1: Outlet Details (form data, no photos)
├── Step 2: Onboarding Photos (5 geo-tagged photos)
│   ├── OUTSIDE_VIEW
│   ├── INSIDE_VIEW
│   ├── COOLER_SPACE
│   ├── SHELF_VISIBILITY
│   └── BRANDING_OPPORTUNITY
├── Step 3: PFP Enrollment (1-2 document photos)
│   ├── Signed PFP Declaration
│   └── Bank Details Verification
└── Step 4: LOCKED (awaiting cooler installation)

Phase 2: Verification (Days 7-30)
└── Step 4: Verification Photos (5 geo-tagged photos)
    ├── COOLER_INSTALLED
    ├── BRANDING_INSTALLED
    ├── PRIME_PLACEMENT
    ├── COMPETITION_AREA
    └── SHELF_VISIBILITY
    |
    v
    ASM/Auditor Verifies -> CDO Complete
```

**Total photos per outlet onboarding: 12 (one-time)**

---

## 8. Key Observations for Hosting Cost

### Architecture
- **No WebSockets / real-time connections** — All HTTP request-response
- **No background polling** — All API calls are user-triggered or page-load
- **No server-side rendering** — Static SPA (Vite build), served from CDN
- **Token auto-refresh** — Adds ~5-10% overhead to API call count on 401s

### Traffic Patterns
- **ASEs are the volume driver** — ~65% of total API traffic, 100% of photo uploads
- **Read-heavy workload** — Write operations (create, approve, mark paid) are <5% of total calls
- **Peak hours** — Expected 9 AM - 6 PM (field working hours for ASEs)
- **Largest API responses** — Invoice lists (up to 100 items), outlet lists (up to 200 items in Payouts)

### Storage
- **Photo storage grows linearly** with outlet count
- **No client-side image compression** — production should add this to reduce S3 costs
- **No CDN thumbnail generation** detected — full-size images served for list thumbnails

### Bandwidth Estimates (Medium deployment)

| Category | Daily | Monthly |
|----------|------:|-------:|
| API responses (JSON) | ~15 MB | ~450 MB |
| Photo uploads (S3) | ~25 MB | ~750 MB |
| Photo downloads (viewing) | ~100 MB | ~3 GB |
| Static assets (SPA bundle) | ~50 MB | ~1.5 GB |
| **Total bandwidth** | **~190 MB** | **~5.7 GB** |

### Recommendations
1. **Add client-side image compression** before upload (resize to 1200px max, 80% JPEG quality) — could reduce photo storage by 60-70%
2. **Generate thumbnails** server-side (200px) for list views to reduce download bandwidth
3. **Implement API response caching** for rarely-changing data (locations, slabs, business list)
4. **Add pagination limits** — the Payouts page fetches 200 outlets at once, should be reduced

---

## 9. Role Access Matrix

| Feature | ADMIN | BIZ_ADMIN | FINANCE_ADMIN | RBL | SM | ASM | ASE | BIZ_USER |
|---------|:-----:|:---------:|:-------------:|:---:|:--:|:---:|:---:|:--------:|
| Dashboard | Y | Y | Y | Y | Y | Y | Y | Y |
| Businesses (CRUD) | Y | - | - | - | - | - | - | - |
| Outlets (View) | Y | Y | Y | Y | Y | Y | Y | Y |
| Outlets (Create) | Y | - | - | - | - | - | Y | - |
| Users (Manage) | Y | Y | Y | - | - | - | - | - |
| Distributors (CRUD) | Y | Y | - | - | - | - | - | - |
| Distributors (View) | Y | Y | Y | Y | Y | Y | Y | Y |
| Slabs (View) | Y | Y | Y | Y | Y | Y | Y | Y |
| Payouts | Y | - | Y | - | - | - | - | - |
| Reports | Y | - | - | - | - | - | - | - |
| Invoice Approve/Reject | Y | - | Y | - | - | - | - | - |
| Run Payout Cycle | Y | - | Y | - | - | - | - | - |
| Mark Paid | Y | - | Y | - | - | - | - | - |
| Upload Photos | - | - | - | - | - | - | Y | - |
| Verify Compliance | - | - | - | - | - | Y | - | - |
| Team Hierarchy | - | - | - | Y | Y | - | - | - |

---

*This analysis is based on the SiteFlow CDO frontend codebase as of 2026-03-06. Backend API behavior may differ from frontend assumptions.*
