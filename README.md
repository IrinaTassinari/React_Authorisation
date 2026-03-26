# Authorization App

A full-stack authentication project with a React frontend and a Node.js/Express backend.

The application allows users to:

- register with email and password
- log in with JWT authentication
- store the token on the client
- access a protected profile page
- log out manually or automatically after token expiration

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Redux Toolkit
- Axios
- jwt-decode

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken

## Project Structure

```text
Authorisation/
├── backend/
│   ├── config/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   └── store/
│   └── package.json
└── README.md
```

## Features

- User registration with hashed passwords
- User login with JWT token generation
- Protected route for the profile page
- Global auth state management with Redux Toolkit
- Token persistence in `localStorage`
- Automatic logout when the token expires
- Lazy-loaded pages with `React.lazy` and `Suspense`

## How It Works

1. A user registers through the frontend form.
2. The backend saves the user in MongoDB and hashes the password before storing it.
3. A user logs in with email and password.
4. The backend validates credentials and returns a JWT token.
5. The frontend stores the token in Redux state and `localStorage`.
6. Protected routes check whether a token is available.
7. Middleware checks token expiration and logs the user out when needed.

## API Endpoints

Base URL:

```text
http://localhost:5000/api/auth
```

Available routes:

- `POST /register` - create a new user
- `POST /login` - authenticate a user and return a JWT token

Example request body:

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

## Installation

Clone the repository and install dependencies separately for the frontend and backend.

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Running the Project

You need to run MongoDB, the backend server, and the frontend dev server.

### 1. Start MongoDB

Make sure MongoDB is running locally on:

```text
mongodb://localhost:27017/authDB
```

### 2. Start the backend

```bash
cd backend
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

## Available Frontend Routes

- `/` - Home page
- `/login` - Login form
- `/register` - Registration form
- `/profile` - Protected profile page

## Current Implementation Notes

- MongoDB connection string is currently hardcoded in the backend.
- JWT secrets are currently hardcoded in the auth routes.
- The registration route and login route use different JWT secrets.
- There is no `.env` configuration yet.
- Backend npm scripts are minimal and do not include a dedicated `start` or `dev` script.
- There are no automated tests configured yet.

## License

This project is provided for educational purposes.
