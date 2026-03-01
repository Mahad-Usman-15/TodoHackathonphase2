from sqlmodel import SQLModel, Field, Column, Integer, ForeignKey
from typing import Optional
from datetime import datetime


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(
        sa_column=Column(Integer, ForeignKey("conversation.id", ondelete="CASCADE"), nullable=False, index=True)
    )
    user_id: int = Field(
        sa_column=Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    )
    role: str = Field(nullable=False)
    content: str = Field(nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class MessageRead(SQLModel):
    id: int
    conversation_id: int
    user_id: int
    role: str
    content: str
    created_at: datetime
