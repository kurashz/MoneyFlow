from sqlalchemy.orm import Session
from datetime import date, timedelta

from app.repositories.transaction_repository import TransactionRepository
from app.schemas.period import StatisticsResponse, DailyStatistics


class StatisticsService:
    def __init__(self, db: Session):
        self.repository = TransactionRepository(db)

    def get_statistics_by_period(
        self, start_date: date, end_date: date
    ) -> StatisticsResponse:
        stats = self.repository.get_statistics_by_period(start_date, end_date)
        return StatisticsResponse(
            period_start=stats["period_start"],
            period_end=stats["period_end"],
            total_income=stats["total_income"],
            total_expense=stats["total_expense"],
            balance=stats["balance"],
            daily_statistics=[
                DailyStatistics(**day) for day in stats["daily_statistics"]
            ],
        )

    def get_daily_statistics(self, target_date: date) -> StatisticsResponse:
        return self.get_statistics_by_period(target_date, target_date)

    def get_weekly_statistics(self, target_date: date) -> StatisticsResponse:
        start_date = target_date - timedelta(days=target_date.weekday())
        end_date = start_date + timedelta(days=6)
        return self.get_statistics_by_period(start_date, end_date)

    def get_monthly_statistics(self, target_date: date) -> StatisticsResponse:
        start_date = date(target_date.year, target_date.month, 1)
        if target_date.month == 12:
            end_date = date(target_date.year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(target_date.year, target_date.month + 1, 1) - timedelta(days=1)
        return self.get_statistics_by_period(start_date, end_date)



