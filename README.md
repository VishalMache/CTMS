<div align="center">
  <img src="client/public/vite.svg" alt="CTMS Logo" width="100"/>
  <h1>CTMS - Campus Training & Management System</h1>
  <p><strong>A Modern, Unified Platform for College Placements & Training Management</strong></p>
  
  [![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.x-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-ORM-1B222D?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)](https://supabase.com/)
</div>

<br/>

## 📖 Overview

**CTMS (Campus Training & Management System)** is a comprehensive, full-stack web application designed to bridge the gap between universities, students, and recruiters. It digitizes the entire campus placement lifecycle—from student registration and resume building to company drives, aptitude tests, and final placements.

Built with a modern tech stack (**PERN + Tailwind**), CTMS offers two distinct experiences:
1. **Student Dashboard:** A student-centric hub for building profiles, uploading documents, applying to companies, taking mock tests, and tracking placement statuses.
2. **TPO (Admin) Dashboard:** A powerful command center for Training and Placement Officers to manage students, organize campus drives, track placement statistics, and broadcast notifications.

---

## ✨ Key Features

### For Students 🎓
- **Rich Profiles:** Manage personal, academic, and skills data. Auto-calculate aggregate percentages and CGPA.
- **Document Vault:** Securely upload and manage resumes, 10th/12th marksheets, and certifications (integrated with Cloudinary).
- **Drive Applications:** View upcoming companies, check eligibility based on academic criteria, and apply with a single click.
- **Mock Tests:** Take timed aptitude, technical, and coding mock tests to prepare for actual placements.
- **Real-time Status:** Track application progress across different selection rounds (Aptitude, Tech Interview, HR, etc.).

### For TPO Administrators 🛡️
- **Student Management:** View the entire student directory, filter by branch/eligibility, and verify academic records.
- **Company Management:** Create drives, define eligibility criteria (e.g., Min 7.0 CGPA, No Active Backlogs), and manage job roles/CTCs.
- **Round Management:** Progress students through custom-defined selection rounds and update statuses (Selected/Rejected).
- **Training Sessions:** Schedule training workshops, track attendance, and monitor student participation.
- **Advanced Analytics:** Generate placement reports, see hiring trends, branch-wise placement metrics, and highest CTCs.
- **Notification System:** Broadcast system-wide or targeted alerts embedded directly in the platform.

---

## 🏗️ System Architecture & Data Flow

The architecture follows a standard Client-Server model with a centralized relational database. Authentication is handled via stateful JSON Web Tokens (JWT).

```mermaid
graph TD
    subgraph Client [Frontend - React + Vite]
        UI[React UI Components]
        Context[Context API - Auth/Theme]
        Query[React Query - Data Fetching]
        Forms[React Hook Form + Zod]
    end

    subgraph Server [Backend - Node + Express]
        Router[Express Routers]
        Auth[JWT Authentication Middleware]
        Controllers[Business Logic Controllers]
        PrismaClient[Prisma ORM]
    end

    subgraph External Services 
        DB[(PostgreSQL - Supabase)]
        CDN[Cloudinary - Image/PDF Storage]
    end

    UI <--> Context
    UI <--> Query
    UI <--> Forms
    
    Query -- HTTP REST API / JSON --> Router
    Router --> Auth
    Auth --> Controllers
    Controllers --> PrismaClient
    
    PrismaClient -- TCP / SQL --> DB
    Controllers -- REST API / Uploads --> CDN
```

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** React 18 with Vite for blazing-fast HMR and optimized builds.
- **Routing:** React Router DOM v6.
- **Styling:** Tailwind CSS v4 with custom CSS variables for native Dark/Light mode support.
- **UI Components:** Hand-crafted accessible components heavily inspired by Shadcn UI (using Radix UI primitives and Lucide Icons).
- **State Management:** React Query (TanStack Query) for server-state caching and React Context API for global auth/theme state.
- **Form Handling:** React Hook Form coupled with Zod for robust client-side validation.

### Backend (Server)
- **Runtime:** Node.js.
- **Framework:** Express.js.
- **Database ORM:** Prisma ORM for type-safe database access, automated migrations, and schema definitions.
- **Authentication:** JSON Web Tokens (JWT) stored securely in HTTP-only cookies, combined with bcrypt for password hashing.
- **File Uploads:** Multer for multipart form parsing, streaming directly to Cloudinary.

### Infrastructure & Database
- **Database:** PostgreSQL (hosted on Supabase) utilizing connection pooling.
- **Storage:** Cloudinary for storing profile photos, resumes, and company notice PDFs.

---

## 🗄️ Database Schema (Prisma)

The database schema is highly relational, utilizing Prisma to enforce referential integrity (`onDelete: Cascade`) and map enums.

```mermaid
erDiagram
    User ||--o| Student : "has one"
    User ||--o{ Notification : "receives"
    Student ||--o{ Certificate : "uploads"
    Student ||--o{ DriveRegistration : "registers for"
    Student ||--o{ RoundResult : "has"
    Student ||--o{ TrainingAttendance : "attends"
    Student ||--o{ MockTestResult : "takes"
    
    Company ||--o{ DriveRegistration : "has candidates"
    Company ||--o{ SelectionRound : "configures"
    
    SelectionRound ||--o{ RoundResult : "produces"
    
    TrainingSession ||--o{ TrainingAttendance : "records"
    
    MockTest ||--o{ MockTestQuestion : "contains"
    MockTest ||--o{ MockTestResult : "generates"

    User {
        String id PK
        String email
        Role role "STUDENT/TPO_ADMIN"
    }
    
    Student {
        String id PK
        String enrollmentNumber
        Float cgpa
        Boolean activeBacklogs
    }
    
    Company {
        String id PK
        String name
        Float ctc
        Float eligibilityCGPA
        CompanyStatus status
    }
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Supabase account (or local PostgreSQL database)
- A Cloudinary account

### 1. Clone the repository
```bash
git clone https://github.com/VishalMache/CTMS.git
cd CTMS
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory.

```properties
# server/.env
PORT=5000

# PostgreSQL Connection String (Supabase)
DATABASE_URL="postgres://user:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"

# JWT Auth Secret
JWT_SECRET="your_very_secure_random_string_here"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Frontend URL (For CORS setup)
CLIENT_URL="http://localhost:5173"
```

### 3. Setup Backend (Server)
```bash
cd server

# Install dependencies
npm install

# Push database schema to Supabase
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Start the development server
npm run dev
```

### 4. Setup Frontend (Client)
Open a new terminal window.
```bash
cd client

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🔒 Security Measures

- **HTTP-Only Cookies:** JWT tokens are never exposed to `localStorage` or JavaScript. They are transported securely via HTTP-Only cookies to prevent XSS attacks.
- **CSRF Protection:** CORS is strictly configured to only accept requests from the declared client URL.
- **Role-Based Access Control (RBAC):** Backend routes and frontend views are strictly protected. A student cannot access TPO endpoints, and vice versa.
- **Password Hashing:** Passwords are hashed using `bcrypt` standard rounds before reaching the database.
- **Provisioning Security:** Creating a new Admin/TPO account requires a hardcoded "Secret Institution Key" (`CPMS-ADMIN-2026`) to prevent unauthorized users from granting themselves admin privileges.

---

## 📱 User Interface Highlights

- **Split-Screen Authentication:** Modern, premium login screen with integrated tab switching for Students and Admins, featuring responsive branding panels.
- **Native Dark/Light Mode:** Global CSS-variable based theme system persisted in local storage. Transitions instantly with a click of a button.
- **Glassmorphism & Micro-interactions:** UI employs subtle blurs, gradient glows, and hover transformations to elevate the user experience.
- **Zero-clutter Dashboard:** The main layout enforces a fixed sidebar for navigation and a top header for global search and notifications, ensuring maximum screen real estate for data tables and charts.

---

<div align="center">
  <i>Developed to revolutionize placement cell operations.</i>
</div>
