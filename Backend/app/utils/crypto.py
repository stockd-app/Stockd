import base64
import hashlib
import os
from dotenv import load_dotenv
from cryptography.fernet import Fernet

load_dotenv()

FERNET_KEY = os.getenv("FERNET_KEY")

if not FERNET_KEY:
    raise ValueError("Missing FERNET_KEY in env")

fernet = Fernet(FERNET_KEY)

def encrypt_str(value: str) -> bytes:
    """
    Encrypt string using Fernet, return bytes for DB storage
    """
    if value is None:
        return None
    return fernet.encrypt(value.encode())

def decrypt_str(value: bytes) -> str:
    """
    Decrypt bytes from DB, return string
    """
    if value is None:
        return None
    return fernet.decrypt(value).decode()

def hash_email(email: str) -> str:
    return hashlib.sha256(email.encode()).hexdigest()
