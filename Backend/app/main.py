from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Stockd Backend",
    version="1.0.0",
    description="A simple backend powered by FastAPI with Swagger UI"
)


# Allow your frontend origin (Vite)
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # URLs that can make requests
    allow_credentials=True,
    allow_methods=["*"],             # Allow all HTTP methods
    allow_headers=["*"],             # Allow all headers
)

# Include all routes
from app.routes import router
app.include_router(router)
