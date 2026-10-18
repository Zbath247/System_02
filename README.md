# University Attendance Management System
### ប្រព័ន្ធគ្រប់គ្រងវត្តមានសាកលវិទ្យាល័យ

A production-grade, bilingual (Khmer & English), full-stack University Attendance Management System designed for 1,000–2,000 users (students, teachers, staff, and administrators).

---

## 🌟 Key Highlights & Architectural Features

1. **One Shared Public System QR Code**:
   - The campus displays **ONE** single System QR Code.
   - Individual students and staff members **do not** need separate QR codes.
   - Scanning the QR Code opens the attendance application; it **never** automatically creates records without identity confirmation and active location selection.
   - Contains **no personal data, IDs, PINs, or session tokens**.

2. **First-Time Registration & Returning Users**:
   - First-time visitors complete a registration form with Khmer Name, English Name, Student/Staff ID, Category, Faculty, Major, and Class.
   - Generates a **persistent, HTTP-only server-managed session cookie** (30 days validity).
   - Returning users on the same phone/device are **instantly recognized** without re-registering or seeing the form again.

3. **Option B Identification for New Phones / Browsers**:
   - When a user changes phones, clears browser cookies, or uses a new browser, they use:
     **"Identify Your Account / សម្គាល់គណនីរបស់អ្នក"**
   - Inputs: Normalized Student ID / Staff ID + Full Name (Khmer or English).
   - Verifies against existing accounts, creates a fresh session, and rejects attempts to create duplicate accounts.
   - Protected with **strict rate-limiting** (5 attempts per 15 minutes) and generic errors to prevent user enumeration.

4. **Robust Attendance Workflows**:
   - Check-in and Check-out at admin-managed active campus locations.
   - **Consecutive Attendance Rule Enforcement**: A user cannot check-in twice consecutively without checking out, and cannot check-out without an open check-in.
   - **Server-Generated UTC Timestamps**: Browser timestamps are never trusted.
   - **Automatic Session Duration Calculation**: Automatically calculates attendance duration in minutes upon checkout.
   - Duplicate submission protection with database transactions and idempotency keys.

5. **Admin Console & Location Management**:
   - Real-time aggregated metric cards: Total users, active accounts, pending approvals, suspended accounts, today's check-ins, today's check-outs, and active open sessions.
   - Location management with soft deactivation (preserving historical attendance data) and optional operating hours.
   - User administration: Approval workflow, account suspension (with **immediate session revocation**), and reactivation.

6. **Reporting & Safe CSV Export**:
   - Filter attendance by date range, department, category, location, and user search.
   - One-click CSV export with **CSV Formula Injection Prevention** (`=`, `+`, `-`, `@` escaped) and **UTF-8 Byte Order Mark (BOM)** so Khmer characters display correctly in Microsoft Excel.

7. **Bilingual Khmer & English UI**:
   - Khmer as the default primary language, English as secondary.
   - Native font support with Google Fonts: *Kantumruy Pro* for Khmer and *Inter* for English.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide Icons, html5-qrcode, qrcode.react |
| **Backend** | Node.js (v20+), Express, TypeScript, Zod, Cookie-Parser, Helmet, Express-Rate-Limit |
| **Database & ORM** | PostgreSQL 16 (production/docker), Prisma ORM, SQLite (local zero-config dev/test) |
| **Testing** | Vitest, Supertest (26 comprehensive integration tests) |
| **Containerization**| Docker, Docker Compose, Nginx |

---

## 🚀 Quick Start Guide (Local Development)

### 1. Prerequisites
- **Node.js**: v20 or higher (v24 tested)
- **npm**: v10 or higher
- **Docker & Docker Compose** (for PostgreSQL production deployment)

---

### 2. Dependency Installation

From the repository root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

---

### 3. Database Initialization & Seeding

The system ships with both **PostgreSQL** schema (`prisma/schema.postgres.prisma`) and **SQLite** schema (`prisma/schema.sqlite.prisma`):

```bash
cd backend

# Generate Prisma Client & Push Database Schema
npx prisma generate
npx prisma db push

# Seed default administrator, active locations, and sample users
npm run db:seed
```

#### Default Seed Accounts (Development Mode):

| Account Type | Identifier / Email | Password | Role |
|---|---|---|---|
| **Super Administrator** | `ADMIN001` or `admin@university.edu.kh` | `Admin@ChangeMe2026!` | `SUPER_ADMIN` |
| **Sample Student** | `STU2026001` (Sok Sovann / សុខ សុវណ្ណ) | N/A (Option B ID + Name) | `STUDENT` |
| **Sample Teacher** | `TEA2026001` (Chan Vibol / ចាន់ វិបុល) | N/A (Option B ID + Name) | `TEACHER` |

> ⚠️ **Security Warning**: Change the default admin password in production via environment variables!

---

### 4. Running the Application

In two separate terminals:

#### Terminal 1: Backend Server (Port 5000)
```bash
cd backend
npm run dev
```
Backend will start on: `http://localhost:5000`

#### Terminal 2: Frontend Dev Server (Port 5173)
```bash
cd frontend
npm run dev
```
Frontend will start on: `http://localhost:5173`

---

## 🧪 Running Automated Tests

Run the complete 26-test integration suite:

```bash
cd backend
npm test
```

### Verified Test Coverage:
- **Registration**: First-time registration, duplicate ID rejection, missing field validation.
- **Identification & Sessions**: Returning user auto-recognition via HTTP-only cookie, Option B Khmer/English name matching, generic 401 on non-existent IDs or mismatches, session logout invalidation.
- **Attendance**: Valid check-in, consecutive check-in prevention, check-out with duration calculation, inactive location rejection, check-out disallowed location rejection.
- **Administration & RBAC**: 401/403 authorization checks, dashboard stats calculation, user suspension & instant session revocation, user reactivation, location management with soft deactivation.
- **Reports & CSV**: Filtered queries, CSV export with UTF-8 BOM and formula injection protection.

---

## 🐳 Docker Compose Deployment (PostgreSQL + Backend + Nginx Frontend)

To start the full stack with persistent PostgreSQL:

```bash
# Start all containers in background
docker compose up -d --build

# View container status
docker compose ps

# View backend logs
docker compose logs -f backend

# Stop containers
docker compose down
```

---

## ⚙️ Environment Variables Configuration

Copy `.env.example` to `.env`:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/university_attendance?schema=public"
PUBLIC_ATTENDANCE_URL="http://localhost:5173/scan"
SESSION_SECRET="your-cryptographic-secret-at-least-32-chars-long"
COOKIE_SECURE="false" # Set to "true" in production with HTTPS
CORS_ORIGIN="http://localhost:5173"
AUTO_APPROVE_STUDENTS="true" # Set to "false" if admin approval is required before check-in
```

---

## 🖨️ Generating & Printing the Shared System QR Code

1. Log in as an Administrator (`/admin/login`).
2. Navigate to **System QR Code** (`/system-qr`).
3. Click **Download Image (PNG)** to save a high-resolution 1000x1000 image for signage.
4. Click **Print QR Code** to trigger the browser's print dialog formatted for wall posters.
5. Place posters at university entrance gates, library check-in points, and laboratory doors.

---

## 💾 Database Backup & Restore Guide

### PostgreSQL Backup
```bash
docker exec -t university_attendance_postgres pg_dump -U postgres university_attendance > attendance_backup.sql
```

### PostgreSQL Restore
```bash
cat attendance_backup.sql | docker exec -i university_attendance_postgres psql -U postgres -d university_attendance
```

---

## 🔒 Security Architecture & Option B Identity Limitations

### Student ID + Name Verification Model:
The requested Option B identification workflow verifies users on new devices via **Student ID + Full Name**.

- **Security Level**: Low-assurance / convenience verification.
- **Threat Model**: It proves that the user knows a student's ID and name, but does not cryptographically authenticate identity against impersonation by classmates who know each other's IDs.
- **Built-in Mitigations**:
  - **Rate Limiting**: Identification endpoint is strictly capped at 5 attempts per 15 minutes.
  - **Account Enumeration Defense**: Invalid ID and invalid name combinations return the exact same generic 401 error code.
  - **Comprehensive Audit Trail**: Every successful and failed attempt is logged with IP address and timestamp in the `AuditLog` database table.
  - **Modular Architecture**: The authentication controller is structured so that SMS OTP, email verification code, or a PIN can be plugged in seamlessly for high-assurance scenarios.
