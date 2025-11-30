from fastapi import APIRouter
from app.api.routes import transactions, statistics

api_router = APIRouter()

api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(statistics.router, prefix="/statistics", tags=["statistics"])



