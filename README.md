# FlagShip — Feature Flag Manager

FlagShip is a full-stack feature flag management platform that helps developers control feature availability across projects and environments without repeatedly changing application code.

## Features

- **Authentication:** Register and log in using JWT-based authentication.
- **Project management:** Create, view, and manage projects.
- **Environment management:** Organize feature flags into Development, Staging, and Production environments.
- **Feature flag management:** Create, view, update, enable, disable, and delete feature flags.
- **Gradual rollouts:** Configure rollout percentages for feature flags.
- **Evaluation API:** Evaluate a feature flag using an environment API key and user identifier.
- **Persistent storage:** Store application data in MongoDB.

## Tech Stack

**Frontend**

- React
- Vite
- Axios
- JavaScript and CSS

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt password hashing

## Prerequisites

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

```bash
cd server
npm install
```

Create a `server/.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/flagship
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

Use a unique, secure JWT secret and never commit `.env`. Ensure MongoDB is running, then start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Configure and start the frontend

Open a second terminal from the repository root:

```bash
cd client
npm install
npm run dev
```

Open the URL displayed by Vite. The configured default is `http://localhost:5173`, and `/api` requests are proxied to the backend at `http://localhost:5000`.

### 4. Use the application

1. Register an account or log in.
2. Create a project.
3. Open the project's environments.
4. Create feature flags and configure their enabled status and rollout percentage.
5. Evaluate flags using an environment API key and a user identifier.

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register a user |
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/projects` | List the authenticated user's projects |
| `POST` | `/api/projects` | Create a project and its environments |
| `GET` | `/api/projects/:projectId` | Retrieve a project |
| `DELETE` | `/api/projects/:projectId` | Delete a project |
| `GET` | `/api/projects/:projectId/environments/:environmentId/flags` | List feature flags |
| `POST` | `/api/projects/:projectId/environments/:environmentId/flags` | Create a feature flag |
| `PATCH` | `/api/projects/:projectId/environments/:environmentId/flags/:flagId` | Update a feature flag |
| `DELETE` | `/api/projects/:projectId/environments/:environmentId/flags/:flagId` | Delete a feature flag |
| `POST` | `/api/projects/:projectId/environments/:environmentId/rotate-key` | Rotate an environment API key |
| `GET` | `/api/evaluate/:flagName?userId=user123` | Evaluate a feature flag |

Protected management endpoints require a JWT in the `Authorization: Bearer <JWT>` header. Flag evaluation requires the environment API key in the `x-api-key` header. The API key is returned only when the project is created or its environment key is rotated; store it securely.

### Evaluate a feature flag

Replace `<ENVIRONMENT_API_KEY>` with a valid API key for the target environment:

```bash
curl --get "http://localhost:5000/api/evaluate/new_checkout_flow" \
  --data-urlencode "userId=user123" \
  --header "x-api-key: <ENVIRONMENT_API_KEY>"
```

The response reports the evaluation result and rollout information. The API key must belong to the environment containing the feature flag.

## Security Notes

- Passwords are hashed before storage.
- Protected management routes require authentication.
- Environment API keys are stored as hashes in the database.
- Environment variables and secrets should not be committed to Git.
- Use HTTPS, appropriate rate limits, and production-grade secret management before deploying publicly.

## Current Scope

FlagShip provides the core feature flag management workflow. Production deployment, automated test coverage, and additional audit and collaboration capabilities can be added in future iterations.

## AI Development Experience

CodeZero was used to review the existing FlagShip source and documentation for this assessment. In this submission, it helped correct the README setup and API examples and address the frontend lint findings. Changes were checked against the project's Vite configuration and backend routes; no additional AI tools or earlier AI-assisted development are claimed here.

## License

No license has been specified yet.
