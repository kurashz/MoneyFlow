from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate, TransactionResponse


class TransactionService:
    def __init__(self, db: Session):
        self.repository = TransactionRepository(db)

    def create_transaction(self, transaction: TransactionCreate) -> TransactionResponse:
        db_transaction = self.repository.create(transaction)
        return TransactionResponse.model_validate(db_transaction)

    def get_transaction(self, transaction_id: int) -> Optional[TransactionResponse]:
        db_transaction = self.repository.get_by_id(transaction_id)
        if not db_transaction:
            return None
        return TransactionResponse.model_validate(db_transaction)

    def get_transactions(
        self,
        skip: int = 0,
        limit: int = 100,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        transaction_type: Optional[str] = None,
    ) -> List[TransactionResponse]:
        transactions = self.repository.get_all(
            skip=skip,
            limit=limit,
            start_date=start_date,
            end_date=end_date,
            transaction_type=transaction_type,
        )
        return [TransactionResponse.model_validate(t) for t in transactions]

    def update_transaction(
        self, transaction_id: int, transaction: TransactionUpdate
    ) -> Optional[TransactionResponse]:
        db_transaction = self.repository.update(transaction_id, transaction)
        if not db_transaction:
            return None
        return TransactionResponse.model_validate(db_transaction)

    def delete_transaction(self, transaction_id: int) -> bool:
        return self.repository.delete(transaction_id)



