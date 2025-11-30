from pydantic import BaseModel, Field, field_serializer, field_validator, ConfigDict, model_validator
from datetime import date, datetime
from typing import Optional, Any


class TransactionBase(BaseModel):
    date: date
    type: str = Field(..., pattern="^(income|expense|adjustment)$")
    amount: float = Field(...)
    category: Optional[str] = None
    description: Optional[str] = None
    
    @model_validator(mode='after')
    def validate_amount(self):
        """Валидация amount: для income и expense должно быть > 0, для adjustment может быть любым"""
        if self.type in ('income', 'expense') and self.amount <= 0:
            raise ValueError('Amount must be greater than 0 for income and expense transactions')
        return self


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    date: date
    type: Optional[str] = Field(None, pattern="^(income|expense|adjustment)$")
    amount: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    
    @model_validator(mode='after')
    def validate_amount(self):
        """Валидация amount: для income и expense должно быть > 0, для adjustment может быть любым"""
        if self.amount is not None and self.type in ('income', 'expense') and self.amount <= 0:
            raise ValueError('Amount must be greater than 0 for income and expense transactions')
        return self
    
    @field_validator('date', mode='before')
    @classmethod
    def parse_date(cls, v: Any) -> date:
        """Преобразует строку в date объект"""
        if v is None:
            raise ValueError("Date is required")
        if isinstance(v, date):
            return v
        if isinstance(v, str):
            if not v.strip():
                raise ValueError("Date cannot be empty")
            try:
                return date.fromisoformat(v)
            except (ValueError, AttributeError):
                try:
                    return datetime.strptime(v, '%Y-%m-%d').date()
                except ValueError:
                    raise ValueError(f"Invalid date format: {v}. Expected YYYY-MM-DD")
        raise ValueError(f"Invalid date type: {type(v)}. Expected str or date")


class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime

    @field_serializer('created_at')
    def serialize_created_at(self, value: datetime) -> str:
        return value.isoformat()

    class Config:
        from_attributes = True

