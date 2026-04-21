from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus
import os
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "stockd_db")

# URL-encode password to handle special characters (@, #, %, etc.)
encoded_password = quote_plus(DB_PASSWORD) if DB_PASSWORD else ""

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{encoded_password}@{DB_HOST}/{DB_NAME}"

# Create engine with connection pooling for better performance
engine = create_engine(
    DATABASE_URL,
    pool_size=10,              # Keep 10 connections open and ready
    max_overflow=20,           # Allow 20 more connections if pool is full
    pool_timeout=30,           # Wait max 30 seconds for a connection
    pool_recycle=3600,         # Recycle connections after 1 hour (prevents stale connections)
    pool_pre_ping=True,        # Test connections before using (handles disconnects)
    echo=False                 # Set to True only for debugging SQL queries
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
