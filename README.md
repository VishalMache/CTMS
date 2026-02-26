# College Placement Management System (CPMS)

CPMS is a comprehensive, full-stack application designed to streamline the campus placement process for both Training & Placement Officers (TPOs) and Students. It handles everything from student profiles and resumes to company drives, selection tracking, mock tests, and actionable analytical reports.

## Features

### For TPO Admins
*   **Student Ledger**: View and manage all registered students, their CGPA, branch, and current placement statuses.
*   **Company Management**: Add recruiting companies and define their CTC offerings and profiles.
*   **Drive & Round Tracking**: Schedule campus drives for companies, define multiple selection rounds (Aptitude, Technical, HR), and track exactly which students clear each round.
*   **Training Workshops**: Schedule training seminars and take bulk attendance records.
*   **Mock Tests**: Create robust MCQ mock tests with time limits and automated server-side evaluation. View leaderboards of student performance.
*   **Analytics Dashboard**: Instantly export CSV matrices of all student placements and view rich Recharts-powered graphs showing branch-wise and company-wise selection distribution.

### For Students
*   **Profile Building**: Digital resume upload and photo handling (via Cloudinary integration).
*   **Drive Registration**: View active campus drives and apply with a single click.
*   **Application Pipeline**: Track the live status of all your applications and see which rounds you have cleared.
*   **Preparation**: Register for TPO training sessions and take real-time Mock Tests with instant scoring.

## Tech Stack

**Frontend (Client)**
- **Framework**: React 18 (Vite)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v3 & Shadcn/UI primitives
- **State Management**: Zustand (Auth/Tokens) & TanStack React Query v5 (Server State)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

**Backend (Server)**
- **Runtime**: Node.js 20 & Express.js 4
- **Database**: Prisma ORM with **PostgreSQL** (Hosted on Supabase)
- **Authentication**: JWT & bcryptjs
- **File Storage**: Multer + Cloudinary SDK v2
- **Validation**: Zod (Shared schemas)

## Setup & Installation

### 1. Environment Variables
Create a `.env` file in the **`/server`** directory based on the following template. Because we use Supabase IPv4 connection poolers, you must supply both `DATABASE_URL` and `DIRECT_URL`.

```env
# PostgreSQL (Supabase Connection Pooler)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-pooler.supabase.com:5432/postgres"

# Auth and Ports
PORT=5000
JWT_SECRET="your_super_secret_jwt_key_here"
CLIENT_URL="http://localhost:5173"

# Cloudinary Integration (Required for Resumes/Photos)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

### 2. Database Initialization
From the `/server` directory, run the Prisma migration tool to generate the PostgreSQL database and sync the schema. Note that because we are pushing directly to Supabase, we use `db push`. 
```bash
cd server
npm install
npx prisma db push
npx prisma generate
```

### 3. Seed the Admin Account
You must seed the initial TPO Admin account to access the dashboard:
```bash
node seedAdmin.js
```
*(Default credentials will be `admin@cpms.edu` / `Tpo@1234`)*

### 4. Running the Application
You will need two terminal windows to run both the frontend and backend concurrently.

**Terminal 1 (Backend API)**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Interface)**
```bash
cd client
npm install
npm run dev
```

The application will now be running at `http://localhost:5173`.
