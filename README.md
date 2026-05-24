# BDA Team Module for a Manufacturing Company

A MERN Stack Business Development Associate (BDA) team management system for manufacturing companies. The application helps a sales/business development team capture leads, track opportunities through a sales pipeline, manage role-based access, record activities, and monitor performance metrics from a central dashboard.

This project was built for the MERN Stack Developer Intern technical assessment under the "Business Development Associate (BDA) Team Module for a Manufacturing Company" option.

## Business Purpose

Manufacturing companies often receive business opportunities from websites, referrals, trade shows, LinkedIn, email campaigns, and direct outreach. Without a structured workflow, teams can lose follow-ups, duplicate work, or miss high-value opportunities.

This system provides a company-ready CRM workflow where:

- Managers can monitor the overall sales pipeline.
- Team leads can track assigned team opportunities.
- BDAs can manage their own leads and activities.
- Leadership can view lead value, conversion rate, won deals, and stage distribution.
- Sales follow-ups are organized through lead details and activity history.

## Key Features

### Authentication and Authorization

- JWT-based login and registration.
- Access token and refresh token flow.
- Protected API routes.
- Role-based access control for company hierarchy.
- Current-user profile endpoint and profile screen.

### Role-Based User Access

| Role | Access Level |
| --- | --- |
| Super Admin | Full access across users, leads, and pipeline data |
| Manager | Company/team-wide lead visibility and management |
| Team Lead | Team-level lead visibility and assignment support |
| BDA | Own assigned leads and lead activities |
| Viewer | Read-only access for reporting and observation |

### Lead Management

- Create, read, update, and delete leads.
- Store company name, contact person, email, phone, industry, source, status, priority, estimated value, notes, and requirements.
- Auto-generated unique lead number.
- Lead scoring and win probability helpers.
- Filtering support by status, source, priority, assigned user, date range, value range, and search text.
- Pagination support for scalable lists.

### Sales Pipeline

- Visual sales pipeline organized by lead status.
- Drag-and-drop movement between pipeline stages.
- Status updates are stored through the backend API.
- Stage-wise lead count and total estimated value.
- Useful for tracking manufacturing sales opportunities from new inquiry to won deal.

### Activity Tracking

- Lead-specific activity timeline.
- Supports calls, emails, meetings, notes, tasks, and status changes.
- Activity status support: pending, completed, cancelled.
- Due date support for follow-up planning.

### Dashboard and Reporting

- Total leads.
- Won deals.
- Total estimated pipeline value.
- Conversion rate.
- Lead status distribution.
- Stage-wise value summary.

### Security and Reliability

- Password hashing with bcrypt.
- Helmet security headers.
- CORS configuration.
- API rate limiting.
- Centralized error handling.
- Request validation with express-validator.
- Winston logging.
- MongoDB schema validations and indexes.

### Sample Data

- Seeder script with realistic manufacturing/business leads.
- Predefined users for Admin, Manager, Team Lead, and BDA roles.
- Sample activities for testing dashboard and lead-detail workflows.

## Tech Stack

### Frontend

- React 18
- Vite
- Redux Toolkit
- React Redux
- React Router DOM
- Material UI
- Axios
- Notistack
- date-fns

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- express-validator
- Winston
- Morgan
- Helmet
- CORS
- express-rate-limit

## Project Structure

```text
mern/
+-- client/
|   +-- src/
|   |   +-- components/
|   |   |   +-- common/
|   |   |   +-- layout/
|   |   +-- constants/
|   |   +-- pages/
|   |   |   +-- Auth/
|   |   |   +-- Dashboard/
|   |   |   +-- Leads/
|   |   |   +-- Pipeline/
|   |   |   +-- Profile/
|   |   +-- redux/
|   |   |   +-- slices/
|   |   +-- services/
|   |   +-- App.jsx
|   |   +-- main.jsx
|   +-- .env.example
|   +-- package.json
|   +-- vite.config.js
|
+-- server/
|   +-- src/
|   |   +-- __tests__/
|   |   +-- config/
|   |   +-- controllers/
|   |   +-- middlewares/
|   |   +-- models/
|   |   +-- routes/
|   |   +-- seeders/
|   |   +-- utils/
|   |   +-- app.js
|   |   +-- server.js
|   +-- .env.example
|   +-- jest.config.js
|   +-- package.json
|
+-- verify-setup.sh
+-- README.md
+-- other project documentation files
```

## Prerequisites

Install the following before running the project locally:

- Node.js 18 or higher
- npm
- MongoDB Community Server or MongoDB Atlas
- Git, for version control

Check versions:

```bash
node -v
npm -v
mongosh --version
```

## Local Setup

Run the backend and frontend in two separate terminals.

### 1. Clone or Open the Project

```bash
cd /path/to/mern
```

If this folder is not already a Git repository, initialize it before submission:

```bash
git init
git add .
git commit -m "initial commit"
```

### 2. Configure Backend Environment

```bash
cd server
cp .env.example .env
```

Update `server/.env`:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/bda-module

JWT_SECRET=replace-with-a-strong-access-token-secret
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=replace-with-a-strong-refresh-token-secret
JWT_REFRESH_EXPIRE=7d

CLIENT_URL=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 3. Install Backend Dependencies

```bash
cd server
npm install
```

### 4. Start MongoDB

If MongoDB is installed locally, make sure it is running.

macOS with Homebrew:

```bash
brew services start mongodb-community
```

Linux:

```bash
sudo systemctl start mongod
```

Verify MongoDB:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

### 5. Seed Sample Data

The seed command creates demo users, leads, and activities. It also clears existing user, lead, activity, and team data from the configured database, so use it only for local/demo setup.

```bash
cd server
npm run seed
```

### 6. Start Backend Server

```bash
cd server
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "..."
}
```

### 7. Configure Frontend Environment

Open a new terminal:

```bash
cd client
cp .env.example .env
```

`client/.env` should contain:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 8. Install Frontend Dependencies

```bash
cd client
npm install
```

### 9. Start Frontend

```bash
cd client
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

## Demo Login Credentials

After running `npm run seed`, use these accounts:

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | admin@bda.com | admin123 |
| Manager | manager@bda.com | manager123 |
| Team Lead | teamlead@bda.com | lead123 |
| BDA | mike@bda.com | mike123 |
| BDA | emily@bda.com | emily123 |

## Recommended Demo Flow

1. Start MongoDB.
2. Start backend with `cd server && npm run dev`.
3. Start frontend with `cd client && npm run dev`.
4. Open `http://localhost:3000`.
5. Login as `admin@bda.com`.
6. View dashboard metrics.
7. Open Leads and create a new manufacturing sales lead.
8. Open Pipeline and drag a lead to another stage.
9. Open a lead detail page and review company data and activities.
10. Login as a BDA user to confirm role-based lead visibility.

## Available Scripts

### Backend Scripts

Run from `server/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Express server with nodemon |
| `npm start` | Start Express server with Node |
| `npm run seed` | Seed local database with demo users, leads, and activities |
| `npm test` | Run Jest tests with coverage |

### Frontend Scripts

Run from `client/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on frontend source files |

## Quality Checks

Run these before submission:

```bash
# Verify folder setup and dependencies
bash verify-setup.sh

# Backend tests
cd server
npm test

# Frontend lint
cd ../client
npm run lint

# Frontend production build
npm run build
```

## API Overview

Base URL:

```text
http://localhost:5000/api/v1
```

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive access/refresh tokens |
| POST | `/auth/refresh-token` | Generate a new access token |
| POST | `/auth/logout` | Logout current user |
| GET | `/auth/me` | Get current authenticated user |
| PUT | `/auth/update-profile` | Update profile details |
| PUT | `/auth/change-password` | Change password |

### Leads

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/leads` | Get leads with filters and pagination |
| GET | `/leads/stats` | Get dashboard statistics |
| POST | `/leads` | Create a lead |
| GET | `/leads/:id` | Get lead details |
| PUT | `/leads/:id` | Update lead |
| DELETE | `/leads/:id` | Delete lead |
| PATCH | `/leads/:id/status` | Update lead status |
| PATCH | `/leads/:id/assign` | Assign lead to another user |

### Activities

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/leads/:id/activities` | Get activities for a lead |
| POST | `/leads/:id/activities` | Create an activity for a lead |

## Data Models

### User

Stores employee/user identity, authentication details, role, team reference, department, targets, and account status.

### Lead

Stores sales opportunity details such as company information, contact person, source, status, priority, estimated value, owner, requirements, notes, scoring, probability, follow-up date, and status history.

### Activity

Stores lead interaction history such as calls, emails, meetings, notes, tasks, due dates, completion status, and outcomes.

### Team

Stores team name, team lead, members, sales targets, region, and active status.

### Client

Prepared data model for converted/won customers, including company details, account manager, revenue, contracts, billing information, and client status.

## Lead Workflow

The sales workflow is designed around these stages:

```text
New -> Contacted -> Qualified -> Proposal -> Negotiation -> Won
```

Additional statuses supported by the backend:

```text
Lost, Nurturing
```

This allows a manufacturing company to track both active opportunities and long-term prospects.

## Security Notes

- Do not commit real `.env` files.
- Replace JWT secrets before deployment.
- Use MongoDB Atlas or a secured MongoDB server for production.
- Restrict CORS to the deployed frontend URL in production.
- Store production secrets in a secure secret manager or hosting provider environment variables.
- Use HTTPS in production.

## Production Build

Build frontend:

```bash
cd client
npm run build
```

Start backend:

```bash
cd server
npm start
```

The frontend `dist/` folder can be deployed to platforms such as Vercel, Netlify, or any static hosting service. The backend can be deployed to Render, Railway, AWS, Azure, or any Node.js hosting environment.

## Troubleshooting

### Backend cannot connect to MongoDB

- Confirm MongoDB is running.
- Confirm `MONGODB_URI` in `server/.env`.
- Try `mongosh --eval "db.runCommand({ ping: 1 })"`.

### Frontend cannot reach backend

- Confirm backend is running on `http://localhost:5000`.
- Confirm `client/.env` has `VITE_API_BASE_URL=http://localhost:5000/api/v1`.
- Restart the frontend after changing `.env`.

### Login fails after setup

- Run `npm run seed` from `server/`.
- Use the sample credentials listed above.
- Confirm the backend terminal shows MongoDB connected.

### Port already in use

Change ports in:

- Backend: `server/.env` -> `PORT`
- Frontend: `client/vite.config.js` -> `server.port`

## Assessment Alignment

This project satisfies the BDA module requirement by implementing:

- Lead pipeline management.
- Sales tracking.
- Client communication history through activities.
- Team-role workflow through RBAC.
- Dashboard and team performance metrics.
- MERN stack architecture.
- Clean folder structure.
- Reusable components and centralized services.
- Local setup documentation.
- Seed data for evaluation.
- Testing, linting, and production build scripts.

## Author

Saidatta Dasari
saidattad09@gmail.com

Built as part of the MERN Stack Developer Intern technical assessment.
