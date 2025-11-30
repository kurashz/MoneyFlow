from pydantic import BaseModel
from datetime import date
from typing import Optional, List


class PeriodRequest(BaseModel):
    start_date: date
    end_date: date


class DailyStatistics(BaseModel):
    date: date
    income: float
    expense: float
    balance: float


class StatisticsResponse(BaseModel):
    period_start: date
    period_end: date
    total_income: float
    total_expense: float
    balance: float
    daily_statistics: List[DailyStatistics]



