from sqlmodel import SQLModel, Field, Column, Integer, ForeignKey
from typing import Optional
from datetime import datetime


class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(
        sa_column=Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False, index=True)
    )
    title: Optional[str] = Field(default=None, max_length=200)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class ConversationRead(SQLModel):
    id: int
    user_id: int
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
