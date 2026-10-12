# FlagShip — Feature Flag Manager

FlagShip is a full-stack feature flag management platform that helps developers control feature availability across projects and environments without repeatedly changing application code. It provides a React dashboard, a REST API, MongoDB-backed storage, and an evaluation endpoint for making feature rollout decisions.

## Features

- **Authentication:** Register and log in using JWT-based authentication.
- **Project management:** Create, view, and manage projects.
- **Environment management:** Organize feature flags into Development, Staging, and Production environments.
- **Feature flag management:** Create, view, update, enable, and disable feature flags.
- **Gradual rollouts:** Configure rollout percentages from 0% to 100%.
- **Evaluation API:** Evaluate a feature flag using an environment API key and user identifier.
- **Persistent storage:** Store application data in MongoDB.
- **Responsive dashboard:** Manage projects, environments, and flags through a React interface.

## Tech Stack

### Frontend
- React
- Vite
- Axios
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing

## Prerequisites

Install the following before running the application:

- Node.js and npm
- MongoDB Community Server
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/kushiarsur/flagship.git
cd flagship
```

### 2. Configure and start the backend

Open a terminal in the project root and run:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory with the following configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/flagship
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

Replace the placeholder JWT secret with a unique, strong random value. Never commit `.env` files or expose secrets in your repository.

Make sure MongoDB is running, then start the backend:

```bash
npm run dev
```

The API runs at:

`http://localhost:5000`

### 3. Configure and start the frontend

Open a second terminal in the project root:

```bash
cd client
npm install
npm run dev
```

Open the URL displayed by Vite. The configured default is:

`http://localhost:5173`

The Vite development server proxies `/api` requests to the backend at `http://localhost:5000`.

### 4. Use the application

1. Register an account or log in.
2. Create a project.
3. Open the project's environments.
4. Create feature flags.
5. Enable or disable flags and configure their rollout percentages.
6. Use the evaluation API to evaluate a flag for a particular user.

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/projects` | List the authenticated user's projects |
| `POST` | `/api/projects` | Create a project and its environments |
| `GET` | `/api/projects/:projectId` | Retrieve a project |
| `DELETE` | `/api/projects/:projectId` | Delete a project through the API |
| `GET` | `/api/projects/:projectId/environments/:environmentId/flags` | List feature flags |
| `POST` | `/api/projects/:projectId/environments/:environmentId/flags` | Create a feature flag |
| `PATCH` | `/api/projects/:projectId/environments/:environmentId/flags/:flagId` | Update a feature flag |
| `DELETE` | `/api/projects/:projectId/environments/:environmentId/flags/:flagId` | Delete a feature flag through the API |
| `POST` | `/api/projects/:projectId/environments/:environmentId/rotate-key` | Rotate an environment API key |
| `GET` | `/api/evaluate/:flagName?userId=user123` | Evaluate a feature flag |

Protected management endpoints require a JWT in the `Authorization: Bearer <JWT>` header.

The evaluation endpoint requires an environment API key in the `x-api-key` header. Store environment keys securely.

The backend exposes the management endpoints listed above; availability of a particular operation in the dashboard may differ from API availability.

## Evaluating a Feature Flag

Use the evaluation endpoint to determine whether a feature flag is enabled for a particular user.

Replace `<ENVIRONMENT_API_KEY>` with a valid key for the environment containing the target flag.

```bash
curl --get "http://localhost:5000/api/evaluate/new_checkout_flow" \
  --data-urlencode "userId=user123" \
  --header "x-api-key: <ENVIRONMENT_API_KEY>"
```

The response includes the evaluation result and rollout information. The decision is based on the flag's enabled state and configured rollout percentage.

## Security Notes

- Passwords are hashed before storage.
- Protected management routes require authentication.
- Environment API keys are stored as hashes in the database.
- Keep `.env` files, JWT secrets, and API keys out of Git.
- Use HTTPS, appropriate rate limits, and production-grade secret management before deploying publicly.
- Store generated environment API keys securely.

## Testing and Current Scope

The application has been manually exercised for its core dashboard and feature flag workflows. The frontend lint and production build checks have passed.

Automated backend test coverage is not yet included. The evaluation playground, activity log, and some dashboard management actions remain areas for future improvement. Production deployment, expanded automated testing, audit history, and collaboration features can be added in future iterations.

## AI Development Experience

Code0 was used during the final review of FlagShip for the StartupMeu technical assessment. It assisted with reviewing the existing implementation, improving documentation, and identifying frontend quality issues. Suggestions were checked against the project configuration and backend implementation before accepting changes.

### Specific Tasks Assisted by Code0

1. **Codebase review:** Inspected the existing frontend and backend structure and identified incomplete dashboard flows and testing gaps.
2. **Documentation improvement:** Corrected README formatting, setup instructions, environment variable examples, and the feature evaluation API example.
3. **Frontend debugging:** Investigated ESLint errors in the React application and helped resolve unused imports and a React Hooks lint issue.
4. **API debugging:** Traced the feature flag rollout update flow across the React UI, API client, and Express backend to investigate update failures.
5. **Validation:** Ran the frontend lint and production build commands to verify the documentation and frontend changes.

Code0's suggestions were reviewed before use. The final implementation was tested manually, and the frontend lint and build checks passed. Code0 assistance described here relates to the final review; it is not a claim that Code0 performed earlier development work.

## License

No license has been specified yet.
