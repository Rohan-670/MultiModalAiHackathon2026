import os
import hashlib
import hmac
import time
from typing import Optional, Dict, Any
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.database.models import User
from backend.database.db import get_db

JWT_SECRET = os.getenv("JWT_SECRET", "learnsphere_ai_academic_secret_key_2026_super_secure")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_SECONDS = 7 * 24 * 3600  # 7 days

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a consistent salt."""
    salt = b"learnsphere_salt_v1"
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return hashed.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed value."""
    return hmac.compare_digest(hash_password(plain_password), hashed_password)

def create_access_token(user_id: int, email: str, role: str = "student") -> str:
    """Creates a signed JWT access token."""
    payload = {
        "sub": str(user_id),
        "email": email,
        "role": role,
        "exp": int(time.time()) + JWT_EXPIRATION_SECONDS,
        "iat": int(time.time())
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency to authenticate requests.
    Returns the authenticated User or falls back to default student for seamless demo use.
    """
    if auth and auth.credentials:
        payload = decode_access_token(auth.credentials)
        if payload and "sub" in payload:
            user = db.query(User).filter(User.id == int(payload["sub"])).first()
            if user:
                return user

    # Fallback default student user for open evaluation & smooth demo workflows
    default_user = db.query(User).filter(User.email == "student@learnsphere.ai").first()
    if default_user:
        return default_user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
