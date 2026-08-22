# DayFlow HRM - Odoo Hackathon Project

DayFlow HRM is a comprehensive Human Resource Management System built with Node.js, Express, and React. It provides essential HR functionalities including employee management, attendance tracking, leave management, and payroll processing.

## Features

- **Employee Management**: Add, update, and view employee profiles with detailed information.
- **Attendance Tracking**: Clock in/out, view attendance history, and generate attendance reports.
- **Leave Management**: Apply for leave, track leave balances, and manage leave approvals.
- **Payroll Processing**: Generate payslips, manage salary structures, and process payroll.
- **User Authentication**: Secure login with role-based access control (Admin, Manager, Employee).
- **Notifications**: Email notifications for leave approvals, payroll generation, and attendance events.
- **Reporting**: Generate comprehensive reports for attendance, leave, and payroll.

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Web framework for building APIs
- **Sequelize** - ORM for database interactions
- **SQLite** - Database management system
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt.js** - Password hashing
- **Nodemailer** - Email notifications
- **Multer** - File uploads

### Frontend
- **React** - JavaScript library for UI development
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client

## Project Structure

```
server/
├── config/          # Database configuration
├── controllers/     # API route handlers
├── middleware/      # Custom middleware (auth, error handling)
├── models/          # Sequelize models
├── routes/          # API route definitions
├── services/        # Business logic and external services
├── utils/           # Utility functions
└── server.js        # Express application entry point

client/
├── src/
│   ├── components/  # Reusable UI components
│   ├── pages/       # Page components
│   ├── services/    # API service functions
│   ├── utils/       # Frontend utility functions
│   └── App.jsx      # Main application component
└── index.html       # HTML entry point
```

## Installation

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server/` directory with the following variables:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_USER=your_email
   EMAIL_PASS=your_password
   ```

4. Run database synchronization and seed:
   ```bash
   npm run sync
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Authentication

Use the following credentials to test the application:

- **Admin**: [EMAIL_ADDRESS] / admin123
- **Manager**: [EMAIL_ADDRESS] / manager123
- **Employee**: [EMAIL_ADDRESS] / employee123


## Development

### Running in Development Mode

Both the frontend and backend can be run simultaneously:

```bash
# Start backend
cd server
npm run dev

# Start frontend (in a separate terminal)
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

### Database

The application uses SQLite for development. The database file is located at `server/database.sqlite`. It will be automatically created on the first run.

## Production

To build the frontend for production:

```bash
cd client
npm run build
```

The production build will be created in the `client/dist/` directory.

To run the backend in production:

```bash
cd server
node server.js
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

- **Project Maintainers**: [Your Name/Team Name]
- **Email**: [Your Email Address]
- **GitHub**: [Your GitHub Profile]

## Acknowledgments

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Odoo](https://www.odoo.com/) (Inspiration)
