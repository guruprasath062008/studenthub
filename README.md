# 🎓 StudentHub – Student Management System
### *Multi-Service Distributed Cloud-Native Deployment*

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📌 Executive Summary

**StudentHub** is a production-ready, beginner-friendly **Multi-Service Student Management System** built for college internal assessments, software engineering evaluations, and portfolio demonstration. 

Rather than a monolithic server, StudentHub is intentionally engineered as **4 decoupled, isolated services** operating inside a dedicated Docker bridge network with health checks, environment configuration, persistent storage volumes, and Nginx reverse proxy routing.

---

## 🏛️ System Architecture

```
                                  [ Browser / Client ]
                                           │
                                           ▼ (Port 3000)
                     ┌───────────────────────────────────────────┐
                     │         Frontend Service (Nginx)          │
                     │  - React 18 SPA + Vite + Tailwind CSS     │
                     │  - Reverse Proxies API traffic            │
                     └───────────────┬───────────┬───────────────┘
                                     │           │
           /api/auth/*               │           │  /api/students/*
           (Port 5001)               │           │  (Port 5002)
                                     ▼           ▼
   ┌───────────────────────────────────┐       ┌───────────────────────────────────┐
   │       Auth Microservice           │       │       Student API Microservice    │
   │  - Node.js + Express              │       │  - Node.js + Express              │
   │  - Bcrypt Password Hashing        │       │  - Full RESTful CRUD Operations   │
   │  - JWT Token Issuance & Verify    │       │  - GPA & Enrollment Analytics     │
   └─────────────────┬─────────────────┘       └─────────────────┬─────────────────┘
                     │                                           │
                     │          Docker Network: studenthub-net   │
                     └─────────────────────┬─────────────────────┘
                                           │ (Port 3306)
                                           ▼
                     ┌───────────────────────────────────────────┐
                     │           MySQL Database Service          │
                     │  - MySQL 8.0 Engine                       │
                     │  - Auto-initialization (init.sql)         │
                     │  - Persistent Volume: studenthub_mysql_data│
                     └───────────────────────────────────────────┘
```

### Architectural Highlights
1. **Frontend Service (`frontend/`)**: React 18 SPA compiled using Vite, hosted by high-performance Nginx Alpine. Nginx reverse-proxies `/api/auth` to the Auth service and `/api/students` to the Student API service, eliminating CORS issues.
2. **Authentication Service (`auth-service/`)**: Isolated microservice for user registration, login, profile retrieval, password hashing with `bcryptjs` (10 rounds), and stateless JWT issuance.
3. **Student API Service (`student-service/`)**: Independent REST service managing student records, search, department filtering, status updates, and GPA metrics.
4. **Database Service (`database/`)**: MySQL 8.0 with automated table migrations, indexes, pre-hashed administrator accounts, and pre-seeded student records across 5 engineering departments.
5. **Persistence**: Docker named volume (`studenthub_mysql_data`) guarantees that data remains safe even when containers are stopped, removed, or rebuilt.

---

## 📁 Project Folder Structure

```
studenthub/
├── docker-compose.yml              # Multi-container orchestration definition
├── .env.example                    # Global environment variables template
├── .gitignore                      # Git exclusion rules
├── README.md                       # Comprehensive project documentation
├── run-local.bat                   # 1-click Windows Batch runner (without Docker)
├── run-local.ps1                   # 1-click PowerShell runner (without Docker)
│
├── database/                       # Database Service
│   ├── Dockerfile                  # MySQL 8.0 container specification
│   └── init.sql                    # Database schema, tables, indexes & seed data
│
├── auth-service/                   # Authentication Microservice
│   ├── Dockerfile                  # Node.js 20 container specification
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js                # Express app entrypoint & middleware
│       ├── config/db.js            # MySQL connection pool & resilient fallback
│       ├── middleware/auth.js      # JWT verification middleware
│       ├── controllers/authController.js
│       └── routes/authRoutes.js
│
├── student-service/                # Student Management API Microservice
│   ├── Dockerfile                  # Node.js 20 container specification
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js                # Express app entrypoint & middleware
│       ├── config/db.js            # MySQL connection pool & resilient fallback
│       ├── middleware/auth.js      # JWT token guard
│       ├── controllers/studentController.js
│       └── routes/studentRoutes.js
│
└── frontend/                       # Frontend Dashboard Service
    ├── Dockerfile                  # Multi-stage build (Node -> Nginx Alpine)
    ├── nginx.conf                  # Production reverse proxy config
    ├── .dockerignore
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── App.jsx                 # Top-level layout & theme provider
        ├── main.jsx                # React DOM entrypoint
        ├── index.css               # Tailwind directives & styles
        ├── context/AuthContext.jsx # Global auth provider (login/logout/token)
        ├── components/
        │   ├── Navbar.jsx          # Top navigation with dark/light mode toggle
        │   ├── Sidebar.jsx         # Collapsible sidebar with topology badges
        │   ├── StatCard.jsx        # Summary cards (Total, Active, GPA, Depts)
        │   ├── StudentTable.jsx    # Table with live search, filters, sorting
        │   ├── StudentModal.jsx    # Add / Edit student form modal
        │   ├── ViewStudentModal.jsx# Student profile ID badge dialog
        │   ├── DeleteConfirmModal.jsx # Delete confirmation prompt
        │   └── Toast.jsx           # Notification alerts
        └── pages/
            ├── Dashboard.jsx       # Overview, directory, analytics, topology
            ├── Login.jsx           # Authentication portal with demo auto-fill
            └── Register.jsx        # Account registration form
```

---

## 🚀 Quickstart: Docker Deployment (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / macOS / Linux)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/studenthub.git
cd studenthub
```

### 2. Configure Environment Variables
```bash
# Copy template environment file
cp .env.example .env
```

### 3. Build and Launch All Services
```bash
docker compose up --build
```

That's it! Docker Compose will automatically:
1. Build images for `database`, `auth-service`, `student-service`, and `frontend`.
2. Create the `studenthub_mysql_data` persistent volume and `studenthub-net` bridge network.
3. Wait for MySQL to become completely healthy before starting backend services.
4. Launch the frontend on port `3000`.

### 4. Access the Application
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Auth Microservice**: [http://localhost:5001](http://localhost:5001)
- **Student API Service**: [http://localhost:5002](http://localhost:5002)
- **MySQL Database**: `localhost:3306`

### 5. Stopping the Containers
```bash
# Stop containers while preserving database volume
docker compose down

# Stop containers and remove volumes (clean wipe)
docker compose down -v
```

---

## 💻 Alternative: Local Run Without Docker

If Docker Desktop is not installed on your machine during development or faculty evaluation, StudentHub includes a built-in runner:

### Windows (1-Click Batch Runner)
Double-click `run-local.bat` or run:
```cmd
run-local.bat
```

### Windows (PowerShell)
```powershell
.\run-local.ps1
```

### Manual Commands
```bash
# Terminal 1: Auth Service
cd auth-service
npm install
npm start

# Terminal 2: Student API Service
cd student-service
npm install
npm start

# Terminal 3: Frontend Dashboard
cd frontend
npm install
npm run dev
```

---

## 🔑 Pre-Configured Demo Credentials

For quick evaluation and testing, the database comes pre-seeded with accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **System Administrator** | `admin@studenthub.local` | `Admin@123` | Full Read/Write & User Management |
| **Faculty Member** | `faculty@studenthub.local` | `Faculty@123` | Student Record CRUD Access |

> **Note**: In the Login screen, click the **"Admin Demo"** or **"Faculty Demo"** button to auto-fill these credentials in 1 click!

---

## 📡 REST API Documentation

### 1. Authentication Service (`:5001`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/auth/health` | Service health status | No |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT | No |
| `GET` | `/api/auth/me` | Fetch logged-in user profile | **Yes (Bearer JWT)** |

#### Example: Login Request
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@studenthub.local", "password": "Admin@123"}'
```

---

### 2. Student API Service (`:5002`)

| Method | Endpoint | Description | Query Params / Body |
|---|---|---|---|
| `GET` | `/api/students/health` | Service health status | — |
| `GET` | `/api/students/stats` | Aggregated dashboard stats | — |
| `GET` | `/api/students` | List student records | `search`, `department`, `status`, `sortBy`, `sortOrder` |
| `GET` | `/api/students/:id` | Get single student | — |
| `POST` | `/api/students` | Create student record | JSON Student Object |
| `PUT` | `/api/students/:id` | Update student record | JSON Student Object |
| `DELETE` | `/api/students/:id` | Delete student record | — |

#### Example: Fetch Students with Filter
```bash
curl "http://localhost:5002/api/students?department=Computer%20Science&status=Active"
```

#### Example: Create Student Record
```bash
curl -X POST http://localhost:5002/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -d '{
    "roll_number": "CS2024099",
    "first_name": "Tanya",
    "last_name": "Kapoor",
    "email": "tanya.k@student.edu",
    "phone": "+91 9876543299",
    "department": "Computer Science",
    "enrollment_date": "2024-08-01",
    "gpa": 3.88,
    "status": "Active"
  }'
```

---

## 🗄️ Database Schema

### Table: `users`
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'faculty',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
);
```

### Table: `students`
```sql
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roll_number VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(60) NOT NULL,
  last_name VARCHAR(60) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  department VARCHAR(80) NOT NULL,
  enrollment_date DATE NOT NULL,
  gpa DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  status ENUM('Active', 'Inactive', 'Graduated', 'Suspended') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_students_roll (roll_number),
  INDEX idx_students_dept (department),
  INDEX idx_students_status (status)
);
```

---

## 🎓 College Faculty Assessment & Viva Q&A Cheat Sheet

| Question | Answer for Faculty / Evaluator |
|---|---|
| **Why use separate microservices instead of a single backend?** | Separation of Concerns (SoC). The Auth service handles security, password hashing, and token issuance; the Student service focuses on domain business logic and data processing. They can scale and be deployed independently. |
| **How do containers talk to each other?** | Docker Compose creates an internal user-defined bridge network (`studenthub-net`). Containers resolve each other using their service names (`http://auth-service:5001`, `db:3306`) via Docker's embedded DNS. |
| **How is database data preserved after container destruction?** | We use a **named Docker volume** (`studenthub_mysql_data`). Volumes are stored outside container write layers on the host file system and persist across container lifecycle events. |
| **How are dependencies between services managed?** | In `docker-compose.yml`, services specify `depends_on` with `condition: service_healthy`. This ensures backend services do not attempt to start until MySQL passes its `mysqladmin ping` health check. |
| **Why use Nginx in front of React?** | Nginx serves static compiled assets with high throughput, handles single-page application fallback routing (`try_files`), and acts as an API gateway reverse proxying `/api/*` requests without CORS overhead. |

---

## 📤 Step-by-Step GitHub Publishing Guide

Follow these steps to publish this complete project to your personal GitHub account:

### 1. Create a New Repository on GitHub
1. Open [github.com/new](https://github.com/new) in your browser.
2. Enter Repository name: `studenthub` (or `student-management-system`).
3. Set Visibility to **Public**.
4. **Uncheck** "Initialize this repository with a README" (we already have a complete one).
5. Click **Create repository**.

### 2. Push Local Project to GitHub
In PowerShell or Command Prompt inside `studenthub`:
```powershell
# 1. Initialize git repository
git init

# 2. Add all files to staging
git add .

# 3. Create initial commit
git commit -m "feat: complete multi-service deployment project for college assessment"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub remote repository (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/studenthub.git

# 6. Push code to GitHub
git push -u origin main
```

Your project will immediately be live on GitHub with full documentation, architecture diagrams, and ready-to-run Docker Compose!

---

## 📄 License
This project is open-source and created for academic evaluation and internal assessment under the MIT License.