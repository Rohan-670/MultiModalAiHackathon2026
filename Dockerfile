# Multi-stage Dockerfile for LearnSphere AI / MARKS Assessment Platform
# Stage 1: Build the React 19 Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend Runtime
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend and Seed Data
COPY backend/ ./backend/
COPY data/ ./data/

# Copy built frontend from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (default 8000)
EXPOSE 8000

ENV HOST=0.0.0.0
ENV PORT=8000

# Start unified FastAPI server (serves both React UI and REST API)
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
