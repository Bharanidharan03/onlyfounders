from fastapi import FastAPI, HTTPException, Depends, Body, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
import os

# Import your existing app
from main import app

# Wrap FastAPI app for serverless
handler = Mangum(app)
