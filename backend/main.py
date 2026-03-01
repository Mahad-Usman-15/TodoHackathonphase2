from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlmodel import SQLModel
import os

load_dotenv()

from db import engine

_cors_env = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [origin.strip() for origin in _cors_env.split(",") if origin.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import all models so SQLModel creates tables
    from models.user import User
    from models.task import Task
    from models.conversation import Conversation
    from models.message import Message
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(title="Todo App API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
def read_root():
    return {"Hello": "World"}


from routes.auth import router as auth_router
app.include_router(auth_router, prefix="/api", tags=["auth"])

from routes.tasks import router as tasks_router
app.include_router(tasks_router, prefix="/api", tags=["tasks"])

from routes.chat import router as chat_router
app.include_router(chat_router, prefix="/api", tags=["chat"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)