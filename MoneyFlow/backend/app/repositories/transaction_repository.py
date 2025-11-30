from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from datetime import date
from typing import List, Optional

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate


class TransactionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, transaction: TransactionCreate) -> Transaction:
        db_transaction = Transaction(**transaction.model_dump())
        self.db.add(db_transaction)
        self.db.commit()
        self.db.refresh(db_transaction)
        return db_transaction

    def get_by_id(self, transaction_id: int) -> Optional[Transaction]:
        return self.db.query(Transaction).filter(Transaction.id == transaction_id).first()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        transaction_type: Optional[str] = None,
    ) -> List[Transaction]:
        query = self.db.query(Transaction)

        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        if transaction_type:
            query = query.filter(Transaction.type == transaction_type)

        return query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()

    def update(self, transaction_id: int, transaction: TransactionUpdate) -> Optional[Transaction]:
        db_transaction = self.get_by_id(transaction_id)
        if not db_transaction:
            return None

        update_data = transaction.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_transaction, field, value)

        self.db.commit()
        self.db.refresh(db_transaction)
        return db_transaction

    def delete(self, transaction_id: int) -> bool:
        db_transaction = self.get_by_id(transaction_id)
        if not db_transaction:
            return False

        self.db.delete(db_transaction)
        self.db.commit()
        return True

    def get_statistics_by_period(
        self, start_date: date, end_date: date
    ) -> dict:
        # Получаем все транзакции за период
        transactions = (
            self.db.query(Transaction)
            .filter(
                and_(
                    Transaction.date >= start_date,
                    Transaction.date <= end_date,
                )
            )
            .order_by(Transaction.date)
            .all()
        )

        # Группируем по датам
        daily_data = {}
        total_income = 0.0
        total_expense = 0.0

        for transaction in transactions:
            trans_date = transaction.date
            if trans_date not in daily_data:
                daily_data[trans_date] = {"income": 0.0, "expense": 0.0}

            if transaction.type == "income":
                amount = float(transaction.amount)
                daily_data[trans_date]["income"] += amount
                total_income += amount
            elif transaction.type == "expense":
                amount = float(transaction.amount)
                daily_data[trans_date]["expense"] += amount
                total_expense += amount

        # Формируем список дневной статистики
        daily_stats = []
        for trans_date in sorted(daily_data.keys()):
            income = daily_data[trans_date]["income"]
            expense = daily_data[trans_date]["expense"]
            daily_stats.append({
                "date": trans_date,
                "income": income,
                "expense": expense,
                "balance": income - expense,
            })

        return {
            "period_start": start_date,
            "period_end": end_date,
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": total_income - total_expense,
            "daily_statistics": daily_stats,
        }

