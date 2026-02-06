#!/bin/bash
cd server
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "Installing/Updating requirements..."
pip install -r requirements.txt
echo "Starting backend server..."
python -m uvicorn main:app --host 0.0.0.0 --port 8000
