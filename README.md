\# FlagShip — Feature Flag Manager



FlagShip is a full-stack feature flag management platform that helps developers control feature availability across projects and environments without repeatedly changing application code.



\## Features



\- \*\*Authentication:\*\* Register and log in using JWT-based authentication.

\- \*\*Project management:\*\* Create, view, and manage projects.

\- \*\*Environment management:\*\* Organize feature flags into Development, Staging, and Production environments.

\- \*\*Feature flag management:\*\* Create, view, update, enable, disable, and delete feature flags.

\- \*\*Gradual rollouts:\*\* Configure rollout percentages for feature flags.

\- \*\*Evaluation API:\*\* Evaluate a feature flag using an API key and user identifier.

\- \*\*Persistent storage:\*\* Store application data in MongoDB.



\## Tech Stack



\*\*Frontend\*\*

\- React

\- Vite

\- Axios

\- JavaScript and CSS



\*\*Backend\*\*

\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JWT authentication

\- bcrypt password hashing



\## Prerequisites



Install the following before running the project:



\- Node.js and npm

\- MongoDB Community Server

\- Git



\## Getting Started



\### 1. Clone the repository



```bash

git clone https://github.com/kushiarsur/flagship.git

cd flagship

```



\### 2. Configure the backend



Open a terminal in the project root:



```bash

cd server

npm install

```



Create a `.env` file inside the `server` directory with the following configuration:



```env

PORT=5000

NODE\_ENV=development

MONGODB\_URI=mongodb://127.0.0.1:27017/flagship

JWT\_SECRET=replace\_with\_a\_long\_random\_secret

JWT\_EXPIRES\_IN=1d

CLIENT\_URL=http://localhost:5174

```



Use your own secure JWT secret. Never commit your actual `.env` file.



Ensure MongoDB is running, then start the backend:



```bash

npm run dev

```



The API runs at `http://localhost:5000`.



\### 3. Configure the frontend



Open a second terminal from the project root:



```bash

cd client

npm install

npm run dev

```



Open the local URL printed by Vite in the terminal. The port may vary if the default port is already in use.



\### 4. Use the application



1\. Register an account or log in.

2\. Create a project.

3\. Open the project's environments.

4\. Create feature flags and configure their enabled status and rollout percentage.

5\. Use the evaluation API to check whether a feature is enabled for a particular user.



\## API Overview



| Method | Endpoint | Purpose |

|---|---|---|

| POST | `/api/auth/register` | Register a user |

| POST | `/api/auth/login` | Authenticate a user |

| GET | `/api/projects` | List the authenticated user's projects |

| POST | `/api/projects` | Create a project |

| GET | `/api/projects/:projectId` | Retrieve a project |

| DELETE | `/api/projects/:projectId` | Delete a project |

| GET | `/api/projects/:projectId/environments/:environmentId/flags` | List feature flags |

| POST | `/api/projects/:projectId/environments/:environmentId/flags` | Create a feature flag |

| PATCH | `/api/projects/:projectId/environments/:environmentId/flags/:flagId` | Update a feature flag |

| DELETE | `/api/projects/:projectId/environments/:environmentId/flags/:flagId` | Delete a feature flag |

| GET | `/api/evaluate/:flagName?userId=user123` | Evaluate a feature flag |



Protected endpoints require a valid JWT in the `Authorization: Bearer <token>` header. Feature flag evaluation uses the environment API key in the `x-api-key` header.



\## Security Notes



\- Passwords are hashed before storage.

\- Protected management routes require authentication.

\- API keys are stored as hashes in the database.

\- Environment variables and secrets should not be committed to Git.

\- Use HTTPS, appropriate rate limits, and production-grade secret management before deploying publicly.



\## Current Scope



FlagShip provides the core feature flag management workflow. Production deployment, automated test coverage, and additional audit and collaboration capabilities can be added in future iterations.



\## AI and Development Tools



Document the tools actually used during development and describe how they assisted. Review and verify generated code before relying on it.



\## License



No license has been specified yet.

