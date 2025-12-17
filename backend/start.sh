#!/bin/bash
# Railway startup script for FastAPI application
# This script runs database migrations before starting the server

set -e

echo "Running database migrations..."
alembic upgrade head

echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

