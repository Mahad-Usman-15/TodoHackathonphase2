from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from db import get_session
from middleware.auth_middleware import get_current_user
from models.user import User
from models.task import TaskCreate, TaskRead, TaskUpdate
from services import task_service

router = APIRouter()


def _enforce_user(user_id: int, current_user: User) -> None:
    """Raise 404 if the path user_id does not match the authenticated user.

    Using 404 (not 403) intentionally prevents user enumeration: an attacker
    cannot distinguish 'user does not exist' from 'user exists but is not you'.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")


@router.get("/{user_id}/tasks", response_model=list[TaskRead])
def list_tasks(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> list[TaskRead]:
    _enforce_user(user_id, current_user)
    return task_service.get_tasks(session, user_id)


@router.post("/{user_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    user_id: int,
    data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskRead:
    _enforce_user(user_id, current_user)
    return task_service.create_task(session, user_id, data)


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskRead)
def get_task(
    user_id: int,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskRead:
    _enforce_user(user_id, current_user)
    task = task_service.get_task(session, user_id, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskRead)
def update_task(
    user_id: int,
    task_id: int,
    data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskRead:
    _enforce_user(user_id, current_user)
    task = task_service.update_task(session, user_id, task_id, data)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.delete("/{user_id}/tasks/{task_id}")
def delete_task(
    user_id: int,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> dict:
    _enforce_user(user_id, current_user)
    deleted = task_service.delete_task(session, user_id, task_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return {"message": "Task deleted successfully"}


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskRead)
def toggle_task(
    user_id: int,
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskRead:
    _enforce_user(user_id, current_user)
    task = task_service.toggle_task(session, user_id, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task
