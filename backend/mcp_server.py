import sys
import os
from contextlib import contextmanager
from datetime import datetime

# Ensure backend directory is in path when spawned as subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from mcp.server.fastmcp import FastMCP
from sqlmodel import Session, select
from db import engine
from models.user import User  # required for FK resolution (task.user_id → user.id)
from models.task import Task

# MCP uses stdout for protocol — silence SQLAlchemy echo so it doesn't corrupt JSON-RPC messages
engine.echo = False
import logging
logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

mcp = FastMCP("taskify-mcp")


@contextmanager
def get_db_session():
    with Session(engine) as session:
        yield session


@mcp.tool()
def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Create a new task for the user. Call this when the user says they want to add, create, or remember something. Always confirm the created task title."""
    uid = int(user_id)
    with get_db_session() as session:
        task = Task(
            user_id=uid,
            title=title,
            description=description if description else None
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return {"task_id": task.id, "status": "created", "title": task.title}


@mcp.tool()
def list_tasks(user_id: str, status: str = "all") -> list:
    """Retrieve tasks from the user's list. Call this when the user asks to see, show, or list their tasks. Use status filter when user asks for 'pending', 'completed', or 'all' tasks."""
    uid = int(user_id)
    with get_db_session() as session:
        query = select(Task).where(Task.user_id == uid)
        if status == "pending":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)
        tasks = session.exec(query).all()
        return [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "completed": t.completed
            }
            for t in tasks
        ]


@mcp.tool()
def complete_task(user_id: str, task_id: int) -> dict:
    """Mark a task as completed. Call this when the user says a task is done, finished, or complete."""
    uid = int(user_id)
    with get_db_session() as session:
        task = session.exec(
            select(Task).where(Task.id == task_id, Task.user_id == uid)
        ).first()
        if not task:
            raise ValueError(f"Task {task_id} not found")
        task.completed = True
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return {"task_id": task.id, "status": "completed", "title": task.title}


@mcp.tool()
def delete_task(user_id: str, task_id: int) -> dict:
    """Remove a task from the user's list permanently. Call this when the user says delete, remove, or cancel a task."""
    uid = int(user_id)
    with get_db_session() as session:
        task = session.exec(
            select(Task).where(Task.id == task_id, Task.user_id == uid)
        ).first()
        if not task:
            raise ValueError(f"Task {task_id} not found")
        stored_title = task.title
        session.delete(task)
        session.commit()
        return {"task_id": task_id, "status": "deleted", "title": stored_title}


@mcp.tool()
def update_task(user_id: str, task_id: int, title: str = None, description: str = None) -> dict:
    """Modify a task's title or description. Call this when the user says change, update, rename, or edit a task."""
    uid = int(user_id)
    if title is None and description is None:
        raise ValueError("At least one field required")
    with get_db_session() as session:
        task = session.exec(
            select(Task).where(Task.id == task_id, Task.user_id == uid)
        ).first()
        if not task:
            raise ValueError(f"Task {task_id} not found")
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
        return {"task_id": task.id, "status": "updated", "title": task.title}


if __name__ == "__main__":
    mcp.run()
