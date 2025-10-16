from fastapi import FastAPI
from app.routes import router

app = FastAPI(
    title="Stockd Backend",
    version="1.0.0",
    description="A simple backend powered by FastAPI with Swagger UI"
)

# Include all routes
app.include_router(router)
