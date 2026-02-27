# DOKA Backend

Backend API for the DOKA luxury cake application. Built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & bcrypt
- **Environment**: dotenv

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    cd backend
    npm install
    ```

2.  **Environment Variables**
    - Rename `.env.example` to `.env`
    - Update `MONGO_URI` with your MongoDB connection string.
    - Update `JWT_SECRET` with a secure secret key.

    ```env
    PORT=5000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    ```

3.  **Run Server**
    ```bash
    npm start
    ```
    The server will start on port 5000 (or the port specified in .env).

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user and get token
- `GET /api/users/me` - Get current user profile (Protected)

## Folder Structure

- `config/` - Database configuration
- `controllers/` - Route logic
- `models/` - Mongoose models
- `routes/` - API route definitions
- `middleware/` - Auth and error handling middleware
- `utils/` - Helper functions
