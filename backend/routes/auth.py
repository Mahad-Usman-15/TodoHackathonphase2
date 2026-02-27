from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import Session
from pydantic import BaseModel, EmailStr
from db import get_session
from services import auth_service
from utils.security import create_access_token
from middleware.auth_middleware import get_current_user
from models.user import User
import os

router = APIRouter()

_IS_PRODUCTION = os.getenv("ENVIRONMENT", "development") == "production"
_COOKIE_SAMESITE = "none" if _IS_PRODUCTION else "lax"
_COOKIE_SECURE = _IS_PRODUCTION


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/auth/register")
def register(
    request: RegisterRequest,
    response: Response,
    session: Session = Depends(get_session)
):
    user = auth_service.create_user(session, request.email, request.username, request.password)
    token = create_access_token({"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite=_COOKIE_SAMESITE,
        secure=_COOKIE_SECURE
    )
    return {
        "message": "User registered successfully",
        "user": {"id": user.id, "email": user.email, "username": user.username}
    }


@router.post("/auth/login")
def login(
    request: LoginRequest,
    response: Response,
    session: Session = Depends(get_session)
):
    user = auth_service.authenticate_user(session, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    token = create_access_token({"sub": str(user.id)})
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite=_COOKIE_SAMESITE,
        secure=_COOKIE_SECURE
    )
    return {
        "message": "Logged in successfully",
        "user": {"id": user.id, "email": user.email, "username": user.username}
    }


@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        samesite=_COOKIE_SAMESITE,
        secure=_COOKIE_SECURE
    )
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "created_at": current_user.created_at
    }
