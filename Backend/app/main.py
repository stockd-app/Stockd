from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os

load_dotenv()

HOST_IP = os.getenv("HOST_IP", "127.0.0.1")

app = FastAPI(
    title="Stockd Backend",
    version="1.0.0",
    description="A simple backend powered by FastAPI with Swagger UI"
)

# Serve built React frontend
app.mount("/assets", StaticFiles(directory="app/static/frontend/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """Catch-all route for React Router paths"""
    index_path = os.path.join("app", "static", "frontend", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "index.html not found"}

# CORS setup (everything under same ngrok domain now)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ENV = os.getenv("ENV", "dev")  # set ENV=prod when deploying

if ENV == "dev":
    # Allow frontend origin (Vite)
    origins = [
        "http://localhost:5173",
        "https://localhost:5173",
        f"http://{HOST_IP}:5173",
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # CORS setup (everything under same ngrok domain now)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include all routes
from app.routes import router
app.include_router(router)
