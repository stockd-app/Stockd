from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.utils.crypto import hash_email
from app.database.database import SessionLocal
from app.database.models import User
import os

bearer_scheme = HTTPBearer()  
def require_google_token(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    """
    Checks if valid Google ID token is provided in the Authorization header

    If the token is valid, return idinfo
    If the token is missing or invalid, raise a 401 unauthorized error
    """
    token = credentials.credentials
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        db = SessionLocal()
        db_user = db.query(User).filter(User.email_hash == hash_email(idinfo["email"])).first()
        db.close()
        if not db_user:
            raise HTTPException(status_code=401, detail="User not found")
        print("Db user:", db_user)
        return db_user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
