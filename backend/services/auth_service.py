from sqlmodel import Session, select
from fastapi import HTTPException, status
from models.user import User
from utils.security import get_password_hash, verify_password


def create_user(session: Session, email: str, username: str, password: str) -> User:
    existing_user = session.exec(select(User).where(User.email == email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    hashed_password = get_password_hash(password)
    user = User(email=email, username=username, hashed_password=hashed_password)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def authenticate_user(session: Session, email: str, password: str):
    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
