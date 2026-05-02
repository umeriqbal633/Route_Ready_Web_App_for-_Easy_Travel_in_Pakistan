# RouteReady Backend

Node.js + Express backend for RouteReady with JWT authentication and MongoDB.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based auth for protected routes
- Auth validation using express-validator
- Secure middleware setup (helmet, cors)
- Health check endpoint

## Project Structure

backend/

- src/
- src/config/
- src/controllers/
- src/middleware/
- src/models/
- src/routes/
- src/utils/
- src/validators/
- src/app.js
- src/server.js
- .env.example
- package.json

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

3. Update environment values in `.env`.

4. Run development server:

```bash
npm run dev
```

5. Production mode:

```bash
npm start
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get authenticated user profile

## Sample Auth Requests

Register:

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ahmed Raza",
  "email": "ahmed@example.com",
  "password": "secret123"
}
```

Login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "secret123"
}
```

Protected route header:

```http
Authorization: Bearer <jwt_token>
```
