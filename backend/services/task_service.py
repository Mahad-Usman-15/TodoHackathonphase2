from sqlmodel import Session, select
from models.task import Task, TaskCreate, TaskUpdate
from datetime import datetime


def get_tasks(session: Session, user_id: int) -> list[Task]:
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
    )
    return list(session.exec(statement).all())


def create_task(session: Session, user_id: int, data: TaskCreate) -> Task:
    now = datetime.utcnow()
    task = Task(
        title=data.title,
        description=data.description,
        user_id=user_id,
        created_at=now,
        updated_at=now,
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def get_task(session: Session, user_id: int, task_id: int) -> Task | None:
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    return session.exec(statement).first()


def update_task(session: Session, user_id: int, task_id: int, data: TaskUpdate) -> Task | None:
    task = get_task(session, user_id, task_id)
    if task is None:
        return None
    task.title = data.title
    task.description = data.description
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def delete_task(session: Session, user_id: int, task_id: int) -> bool:
    task = get_task(session, user_id, task_id)
    if task is None:
        return False
    session.delete(task)
    session.commit()
    return True


def toggle_task(session: Session, user_id: int, task_id: int) -> Task | None:
    task = get_task(session, user_id, task_id)
    if task is None:
        return None
    task.completed = not task.completed
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
