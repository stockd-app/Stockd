from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
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
        # print(f"Verifying token: {token[:50]}...")
        print(token)
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        print(f"Token verified for email: {idinfo.get('email')}")
        
        db = SessionLocal()
        try:
            db_user = db.query(User).filter(User.email == idinfo["email"]).first()
            if not db_user:
                print(f"User not found in database: {idinfo['email']}")
                raise HTTPException(status_code=401, detail="User not found")
            print(f"User found: {db_user.email}, ID: {db_user.id}")
            return db_user
        finally:
            db.close()
    except HTTPException:
        raise
    except Exception as e:
        print(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid or expired token: {str(e)}")
