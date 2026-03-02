# Backend Service

This is the backend service for the SISWIT application.

## Prerequisites
- Node.js
- MongoDB (Local Compass or Atlas)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (if not exists) with:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/siswit
   JWT_SECRET=your_jwt_secret_key
   ```

## Running
- Development (with nodemon):
  ```bash
  npm run dev
  ```
  *Note: I added a dev script to package.json*

- Production:
  ```bash
  node server.js
  ```

## API Endpoints
- `POST /api/auth/signup`: Register a new user
- `POST /api/auth/login`: Login user
- `POST /api/auth/forgot-password`: Request password reset
