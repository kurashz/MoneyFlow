from pydantic import BaseModel, Field, field_serializer
from datetime import date, datetime
from typing import Optional


class TransactionBase(BaseModel):
    date: date
    type: str = Field(..., pattern="^(income|expense)$")
    amount: float = Field(..., gt=0)
    category: Optional[str] = None
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    type: Optional[str] = Field(None, pattern="^(income|expense)$")
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    description: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime

    @field_serializer('created_at')
    def serialize_created_at(self, value: datetime) -> str:
        return value.isoformat()

    class Config:
        from_attributes = True

