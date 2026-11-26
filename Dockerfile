# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Python Backend & Package Together
FROM python:3.10-slim
WORKDIR /code

# Install system dependencies needed for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU version (saves 2GB of container space, runs perfectly on CPU)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install backend dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy FastAPI backend code
COPY backend/app ./app
COPY backend/models ./models

# Copy built React frontend files from Stage 1
COPY --from=frontend-builder /frontend/dist ./frontend_dist

# Create necessary directories
RUN mkdir -p app/static/uploads app/static/reports app/static/sent_emails

# Expose port (Hugging Face uses port 7860 by default)
EXPOSE 7860

# Start FastAPI server on port 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
