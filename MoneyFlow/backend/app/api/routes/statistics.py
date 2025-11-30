from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.services.statistics_service import StatisticsService
from app.schemas.period import StatisticsResponse, PeriodRequest

router = APIRouter()


@router.get("/period", response_model=StatisticsResponse)
def get_statistics_by_period(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
):
    service = StatisticsService(db)
    return service.get_statistics_by_period(start_date, end_date)


@router.get("/daily", response_model=StatisticsResponse)
def get_daily_statistics(
    date: date = Query(..., description="Date for daily statistics"),
    db: Session = Depends(get_db),
):
    service = StatisticsService(db)
    return service.get_daily_statistics(date)


@router.get("/weekly", response_model=StatisticsResponse)
def get_weekly_statistics(
    date: date = Query(..., description="Any date within the week"),
    db: Session = Depends(get_db),
):
    service = StatisticsService(db)
    return service.get_weekly_statistics(date)


@router.get("/monthly", response_model=StatisticsResponse)
def get_monthly_statistics(
    date: date = Query(..., description="Any date within the month"),
    db: Session = Depends(get_db),
):
    service = StatisticsService(db)
    return service.get_monthly_statistics(date)


@router.get("/summary", response_model=StatisticsResponse)
def get_summary(
    start_date: date = Query(None),
    end_date: date = Query(None),
    db: Session = Depends(get_db),
):
    service = StatisticsService(db)
    if start_date and end_date:
        return service.get_statistics_by_period(start_date, end_date)
    else:
        # Если даты не указаны, возвращаем статистику за все время
        # Для этого нужно получить первую и последнюю транзакцию
        from app.repositories.transaction_repository import TransactionRepository
        repo = TransactionRepository(db)
        transactions = repo.get_all(limit=1)
        if not transactions:
            # Если транзакций нет, возвращаем пустую статистику
            return StatisticsResponse(
                period_start=date.today(),
                period_end=date.today(),
                total_income=0.0,
                total_expense=0.0,
                balance=0.0,
                daily_statistics=[],
            )
        
        # Получаем все транзакции для определения диапазона дат
        all_transactions = repo.get_all(limit=10000)
        if all_transactions:
            dates = [t.date for t in all_transactions]
            return service.get_statistics_by_period(min(dates), max(dates))
        else:
            return StatisticsResponse(
                period_start=date.today(),
                period_end=date.today(),
                total_income=0.0,
                total_expense=0.0,
                balance=0.0,
                daily_statistics=[],
            )



