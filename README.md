# Maintrix - Office Maintenance Software

Maintrix is a modern office maintenance and ticket management platform. It streamlines workflows between employees, managers, and technicians with role-based dashboards, real-time chat, and issue tracking. Built on the MERN stack, it ensures rapid resolution of workplace support requests while providing transparent operational auditing.

**Live Website URL:** [https://maintrix-44806187079.us-central1.run.app](https://maintrix-44806187079.us-central1.run.app)

---

## Executive Overview

### The Problem
Managing office maintenance requests is often chaotic, relying on disjointed emails or paper trails. Employees struggle to track the status of their issues, managers lack visibility into operational efficiency, and technicians face disorganized task assignments, leading to delayed resolutions and decreased workplace productivity.

### The Solution
Maintrix provides a centralized, transparent, and role-driven platform for managing maintenance requests. It bridges the communication gap by offering a single unified interface where employees can report issues, managers can triage and assign tasks, and technicians can update statuses in real-time.

### Tech Innovations
- **Role-Based Dynamic Dashboards:** Tailored user experiences with secure access controls ensuring users only see what matters to them.
- **Real-Time Synchronization:** Instant updates on ticket statuses and integrated chat systems for contextual communication.
- **Auditable Workflows:** Comprehensive history tracking and operational logging for transparency and accountability.

### Core Product Modules
- **Employee Portal:** Submit tickets, track progress, and communicate with assigned technicians.
- **Manager Dashboard:** Oversee all operations, assign tickets, manage team workflows, and view system audits.
- **Technician Interface:** Receive assignments, update ticket statuses (e.g., in-progress, resolved), and communicate directly with reporters.
- **Communication Hub:** Embedded real-time chat system tied directly to specific maintenance tickets.

---

## What Is Implemented Today
- Full JWT-based authentication system with secure routing.
- Complete role-based access control (RBAC) for Employees, Managers, and Technicians.
- End-to-end ticket lifecycle management (Creation, Assignment, Resolution, Rejection).
- Interactive, responsive, and visually appealing UI built with React and Tailwind CSS.
- Persistent data storage with MongoDB.

---

## Tech Stack

| Category | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | High-performance user interface framework. |
| | Tailwind CSS | Utility-first CSS framework for rapid UI styling. |
| | Framer Motion | Production-ready animation library for React. |
| | Lucide React | Clean, consistent, and customizable icon set. |
| **Backend** | Node.js & Express.js | Fast, unopinionated, minimalist web framework for the backend API. |
| | JWT (JSON Web Tokens) | Secure, stateless authentication mechanism. |
| **Database** | MongoDB | NoSQL database for flexible and scalable document storage. |
| | Mongoose | Elegant MongoDB object modeling for Node.js. |
| **Deployment** | Google Cloud Run | Fully managed compute platform for containerized applications. |
| | Docker | Containerization platform for consistent deployments. |

---

## Architecture (High Level)
Maintrix follows a decoupled client-server architecture:
1. **Client Layer:** A React Single Page Application (SPA) that communicates with the backend via RESTful APIs. It manages state locally and handles UI routing.
2. **Application Layer:** An Express.js server that processes business logic, validates requests, authenticates users, and orchestrates database interactions.
3. **Data Layer:** A MongoDB database (hosted on MongoDB Atlas) that securely persists all user data, tickets, and chat histories.

---

## Repository Structure

```
MAINTRIX/
├── frontend/             # React (Vite) frontend application
│   ├── src/              # React components, pages, context, and API logic
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite bundler configuration
├── backend/              # Node.js Express backend application
│   ├── models/           # Mongoose database schemas
│   ├── routes/           # Express API route definitions
│   ├── middleware/       # Custom middleware (e.g., JWT verification)
│   ├── server.js         # Backend entry point
│   └── .env              # Environment variables (local)
├── Dockerfile            # Container configuration for production deployment
├── env.yaml              # Production environment variables for Cloud Run
└── README.md             # Project documentation
```

---

## Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas account)
- [Git](https://git-scm.com/)

### 1. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 2. Configure environment variables

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/maintrix
JWT_SECRET=your_super_secret_jwt_key
```
*(Note: If using MongoDB Atlas, replace the `MONGODB_URI` with your Atlas connection string).*

### 3. Run in development

You will need two terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
The frontend will typically be accessible at `http://localhost:5173`.

### 4. Build for production

**Frontend Build:**
```bash
cd frontend
npm run build
```
This generates optimized static files in the `frontend/dist` directory.

---

## Available Scripts

### Backend (`/backend`)
- `npm start`: Runs the server using Node.
- `npm run dev`: Runs the server using Nodemon for auto-reloading.

### Frontend (`/frontend`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run preview`: Locally previews the production build.

---

## Security Notes (Important)
- **Environment Variables:** Never commit `.env` or `env.yaml` files containing sensitive credentials (like database passwords or JWT secrets) to public repositories.
- **Authentication:** All protected API routes require a valid JWT token passed in the `Authorization` header.
- **Database Access:** In production, ensure your MongoDB Atlas Network Access is restricted to trusted IPs (like your application server IPs) rather than `0.0.0.0/0` if possible.

---

## Deployment
This project is configured to be deployed using Docker and Google Cloud Run.
1. Authenticate with Google Cloud CLI (`gcloud auth login`).
2. Build and deploy using the provided `Dockerfile` and `env.yaml`:
```bash
gcloud run deploy maintrix --source . --env-vars-file env.yaml --region us-central1 --allow-unauthenticated
```

---

## Roadmap
- [ ] Push notifications for real-time ticket updates.
- [ ] Advanced analytics dashboard for Managers (ticket resolution times, technician performance).
- [ ] Integration with email services for external notifications.
- [ ] Mobile-optimized PWA (Progressive Web App) enhancements.

---

## License
This project is licensed under the [MIT License](LICENSE). Copyright (c) 2026 Debdatta Panda

## Author
Debdatta Panda
LinkedIn: https://www.linkedin.com/in/debdatta-panda-dp11
