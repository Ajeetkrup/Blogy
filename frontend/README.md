# Blogy Frontend

Next.js frontend application for Blogy with authentication integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file in the `frontend` directory:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Features

- Sign up page with email verification
- Sign in page with authentication
- Protected dashboard page
- JWT token management with automatic refresh
- Zustand state management
- Tailwind CSS styling

## Pages

- `/` - Home page
- `/signup` - User registration
- `/signin` - User login
- `/dashboard` - Protected dashboard (requires authentication)

## API Integration

The frontend integrates with the FastAPI backend at the URL specified in `NEXT_PUBLIC_API_URL`.

Endpoints used:
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

