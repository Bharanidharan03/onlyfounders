FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    git \
    ffmpeg \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY server/requirements.txt .

# Install Python dependencies
# Force CPU-only for torch to save space
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu torch
RUN pip install --no-cache-dir -r requirements.txt

# Copy the server code
COPY server/ /app/server/
COPY .env /app/server/.env

# Create data directories
RUN mkdir -p /app/server/vector_db /app/server/uploads /app/server/data

# Expose port
EXPOSE 8000

# Run the application
WORKDIR /app/server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
