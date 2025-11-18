from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
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
        return idinfo
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
