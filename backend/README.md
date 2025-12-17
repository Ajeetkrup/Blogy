# Blogy API - FastAPI Authentication System

A complete user authentication system with JWT access tokens, HTTP-only refresh token cookies, email verification, and password reset.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file with the following variables:

```
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/blogydb

SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com

FRONTEND_URL=http://localhost:3000
```

**Note**: The `DATABASE_URL` should use the `postgresql+asyncpg://` scheme for async SQLAlchemy support.

### 3. Set Up PostgreSQL Database

1. **Install PostgreSQL** (if not already installed)
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create Database**
   ```bash
   createdb blogydb
   ```
   Or using psql:
```sql
   CREATE DATABASE blogydb;
```

3. **Run Migrations**
   ```bash
   alembic upgrade head
   ```

   To create a new migration:
```bash
   alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

### 4. Start the Server

```bash
uvicorn app.main:app --reload
```

## Database Migrations

This project uses Alembic for database migrations. The migrations are stored in the `alembic/versions/` directory.

### Common Alembic Commands

- **Create a new migration**: `alembic revision --autogenerate -m "description"`
- **Apply migrations**: `alembic upgrade head`
- **Rollback one migration**: `alembic downgrade -1`
- **Show current revision**: `alembic current`
- **Show migration history**: `alembic history`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user, sends verification email |
| GET | `/auth/verify-email/{token}` | Verify email address |
| POST | `/auth/login` | Login, returns access token + sets refresh cookie |
| POST | `/auth/logout` | Revoke refresh token, clears cookie |
| POST | `/auth/refresh` | Get new access token using refresh cookie |
| POST | `/auth/forgot-password` | Send password reset email |
| POST | `/auth/reset-password/{token}` | Reset password with token |
| GET | `/auth/me` | Get current user (protected) |

## Authentication Flow

1. **Register**: User registers with email/password, receives verification email
2. **Verify**: User clicks verification link to activate account
3. **Login**: User logs in, receives access token (15min) and refresh cookie (7 days)
4. **API Calls**: Include `Authorization: Bearer <access_token>` header
5. **Refresh**: When access token expires, call `/auth/refresh` to get new one
6. **Logout**: Revokes refresh token and clears cookie

## Token Strategy

- **Access Token**: JWT, 15 min expiry, returned in JSON response
- **Refresh Token**: UUID stored in DB, 7 days expiry, HTTP-only secure cookie
- **Verification/Reset Tokens**: UUID, 24h/1h expiry respectively

## Railway Deployment

This application is configured for deployment on Railway. The following files are included:

- **`Procfile`**: Defines the web process using uvicorn with Railway's `$PORT` variable
- **`runtime.txt`**: Specifies Python version (3.13)
- **`start.sh`**: Optional startup script that runs migrations before starting the server

### Deployment Steps

1. **Create a Railway Project**
   - Go to [Railway](https://railway.app) and create a new project
   - Choose "Deploy from GitHub repo" and select your repository

2. **Add PostgreSQL Service**
   - In Railway dashboard, add a PostgreSQL service
   - Railway will automatically provide `DATABASE_URL` environment variable

3. **Configure Environment Variables**
   Set these in Railway dashboard (Settings → Variables):
   - `DATABASE_URL` - Automatically provided by PostgreSQL service
   - `SECRET_KEY` - Generate a strong secret key for production
   - `ALGORITHM` - Default: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` - Default: `15`
   - `REFRESH_TOKEN_EXPIRE_DAYS` - Default: `7`
   - `MAIL_USERNAME` - Your email address
   - `MAIL_PASSWORD` - Email app password
   - `MAIL_FROM` - Sender email address
   - `MAIL_PORT` - Default: `587`
   - `MAIL_SERVER` - SMTP server (e.g., `smtp.gmail.com`)
   - `FRONTEND_URL` - Your deployed frontend URL

4. **Run Database Migrations**
   - Option A: Use the `start.sh` script by updating Procfile to: `web: bash start.sh`
   - Option B: Run manually via Railway CLI: `railway run alembic upgrade head`

5. **Generate Public Domain**
   - In Railway dashboard → Service Settings → Networking → Generate Domain

### Alternative: Using Startup Script for Auto-Migrations

To automatically run migrations on each deployment, update the `Procfile` to:
```
web: bash start.sh
```

This will run `alembic upgrade head` before starting the server.