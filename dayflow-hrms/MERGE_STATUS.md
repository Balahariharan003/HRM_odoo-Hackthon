# Dayflow HRMS - Feature Branch Merge Status & Documentation

This document describes the final integration status of the three Dayflow HRMS feature branches (`module1`, `module2`, and `module3`) into the `main` branch. It provides conflict resolution details, comprehensive database schema information, local setup guides, and verification steps.

---

## 1. Branch Integration & Conflict Resolution

The merge process integrated three branches in the following order:
1. `module1` (Profile Management, Signup/Signin Directory)
2. `module2` (Attendance and Leave Management system)
3. `module3` (Payroll Management and Executive Reports with Notifications)

### Conflict Resolutions Detail
- **`.gitignore`**: Combined the root ignores from `main` and `module1` to ignore database engines, build directories, logs, and sensitive settings:
  ```
  *.sqlite
  *.sqlite3
  *.db
  .env
  node_modules/
  uploads/
  dist/
  build/
  ```
- **SQLite Database Conflicts**: Deleted all local sqlite database locks and untracked artifacts (`dayflow-hrms/server/database.sqlite`, `server/database.sqlite`, etc.) and staged deletions to allow database sync engines to restart cleanly.
- **Client Configuration & Main Components**:
  - `client/index.html`: Merged the HEAD modern styling, Google Fonts imports, and Title setup with Module 3 integrations.
  - `client/package.json`: Maintained React 18 base compatibility and added `react-hot-toast` for unified interactive user notifications.
  - `client/src/App.jsx`: Fully merged routes from Module 2 (`/dashboard`, `/attendance`, `/admin/attendance`, `/leave/apply`, `/leave/my-leaves`, `/admin/leave/approvals`, `/login`) and Module 3 (`/payroll`, `/admin/payroll`, `/admin/reports`, `/reports`). All routes are wrapped inside the authentication/role-check wrapper layouts.
  - `client/src/index.css`: Retained HEAD's responsive Tailwind directives to secure application aesthetic consistency and layout cards.
  - `client/vite.config.js`: Maintained HEAD's proxy mapping (`/api` -> `http://localhost:5000`) to guarantee correct cross-origin local API queries.
- **Server Application Configuration**:
  - `server/app.js`: Registered all endpoints from both modules in one place (`/api/auth`, `/api/attendance`, `/api/leave`, `/api/payroll`, `/api/reports`, `/api/notifications`).
  - `server/middleware/authMiddleware.js`: Merged the JWT parser and verification from HEAD alongside with fallback options (like `x-user-id` and raw token matching) from Module 3 to secure all testing and execution scenarios.
  - `server/controllers/leaveController.js`: Unified Module 2 leave controllers (`applyLeave`, `getMyLeaves`, `getAllLeaveRequests`, `cancelLeave`) with Module 3's `approveLeave` notification dispatch routine.
- **Database Models & Associations (`server/models/`)**:
  - `User.js`: Restored `password` columns from HEAD for Auth flows, and configured `role` as a robust string.
  - `Profile.js`: Consolidated all attributes from both modules, including `employeeId`, `department`, `designation`, `phone`, `status`, and `salaryStructure` JSON format.
  - `Attendance.js`: Unified status ENUM fields (`'Present', 'Absent', 'Half-day', 'HalfDay', 'Leave'`), and maintained custom `totalHours` hooks based on checkout durations.
  - `Leave.js`: Configured generic `leaveType` string compatibility and made `reason` nullable for cross-module insertions.
  - `index.js`: Consolidated all models (`User`, `Profile`, `Payroll`, `Notification`, `Attendance`, `Leave`) block initializations and mapping relationships.

---

## 2. Database Schema Design

The integrated Sequelize models construct the following tables inside the local SQLite database (`server/database.sqlite`):

### Users Table
- `id` (UUID, Primary Key)
- `name` (STRING)
- `email` (STRING, Unique, validated format)
- `password` (STRING, Nullable fallback)
- `role` (STRING, Default: `'Employee'`)
- `createdAt` & `updatedAt` (DATETIME)

### Profiles Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key referencing Users.id)
- `employeeId` (STRING, Unique)
- `department` (STRING, Default: `'General'`)
- `designation` (STRING)
- `phone` (STRING, Nullable)
- `status` (STRING, Default: `'Active'`)
- `salaryStructure` (JSON, Nullable)
- `createdAt` & `updatedAt` (DATETIME)

### Attendances Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key referencing Users.id)
- `date` (DATEONLY, Unique index on `[userId, date]`)
- `checkIn` (STRING, Nullable)
- `checkOut` (STRING, Nullable)
- `totalHours` (FLOAT, Calculated automatically in hooks)
- `status` (ENUM: `'Present', 'Absent', 'Half-day', 'HalfDay', 'Leave'`)
- `location` (STRING, Nullable)
- `notes` (TEXT, Nullable)
- `createdAt` & `updatedAt` (DATETIME)

### Leaves Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key referencing Users.id)
- `leaveType` (STRING, Default: `'Paid'`)
- `startDate` (DATEONLY)
- `endDate` (DATEONLY)
- `totalDays` (FLOAT, Default: 1.0)
- `halfDay` (BOOLEAN, Default: false)
- `halfDaySession` (ENUM: `'Morning', 'Afternoon'`, Nullable)
- `reason` (TEXT, Nullable)
- `status` (ENUM: `'Pending', 'Approved', 'Rejected'`, Default: `'Pending'`)
- `approvedBy` (UUID, Foreign Key referencing Users.id, Nullable)
- `approvedAt` (DATETIME, Nullable)
- `comments` (TEXT, Nullable)
- `createdAt` & `updatedAt` (DATETIME)

### Payrolls Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key referencing Users.id)
- `month` (STRING)  -- Format: "YYYY-MM"
- `basicSalary` (FLOAT)
- `allowances` (FLOAT)
- `deductions` (FLOAT)
- `netSalary` (FLOAT)
- `status` (STRING)  -- "Draft" | "Processed" | "Paid"
- `createdAt` & `updatedAt` (DATETIME)

### Notifications Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key referencing Users.id)
- `type` (STRING)
- `title` (STRING)
- `message` (TEXT)
- `link` (STRING, Nullable)
- `isRead` (BOOLEAN, Default: false)
- `createdAt` & `updatedAt` (DATETIME)

---

## 3. Setup Instructions (Local Development)

Because Module 1 uses a sub-folder structure and Modules 2 & 3 run at the repo root, here is how to run both systems.

### A. Root Application (Modules 2 & 3)
1. **Navigate to the Root folder**:
   ```bash
   # From the workspace base:
   cd client
   npm install
   cd ../server
   npm install
   ```
2. **Setup Server Environment**:
   Create a `.env` in the root `server` folder:
   ```env
   PORT=5000
   JWT_SECRET=supersecretkey123
   ```
3. **Run Application**:
   - Start Server: `npm run dev` or `node server.js` from `server/` directory.
   - Start Client: `npm run dev` from `client/` directory.

### B. Module 1 Subfolder Application
1. **Navigate to the `dayflow-hrms` Subfolder**:
   ```bash
   cd dayflow-hrms/client
   npm install
   cd ../server
   npm install
   ```
2. **Setup Module 1 Environment**:
   Create a `.env` in `dayflow-hrms/server`:
   ```env
   PORT=5000
   JWT_SECRET=supersecretkey123
   ```
3. **Run Module 1 Application**:
   - Start Server: `npm start` from `dayflow-hrms/server/` directory.
   - Start Client: `npm run dev` from `dayflow-hrms/client/` directory.

---

## 4. Verification Checklist

To prove all components verify correctly without errors:
1. **Client Bundling Verification**:
   - Open terminal in root `client` directory and compile matching outputs:
     ```bash
     npx vite build
     ```
     This confirms all imported layout components, payroll pages, routing structures, and navigation paths resolve correctly.
2. **API Model Loading Verification**:
   - Run the Sequelize initialization check from the repo root:
     ```bash
     node -e "const db = require('./server/models'); console.log('Sequelize Models:', Object.keys(db.sequelize.models));"
     ```
     Verify that the output contains all 6 initialized models: `'User', 'Profile', 'Payroll', 'Notification', 'Attendance', 'Leave'`.

---

## 5. Modified Files Log
The following files were successfully updated and reconciled to resolve merge conflicts under branch `main`:
- `client/index.html`
- `client/package.json`
- `client/package-lock.json`
- `client/src/App.jsx`
- `client/src/index.css`
- `client/src/main.jsx`
- `client/vite.config.js`
- `server/app.js`
- `server/controllers/leaveController.js`
- `server/middleware/authMiddleware.js`
- `server/models/index.js`
- `server/models/User.js`
- `server/models/Profile.js`
- `server/models/Attendance.js`
- `server/models/Leave.js`
- `dayflow-hrms/server/database.sqlite` (Deleted)
- `.gitignore` (Updated)
