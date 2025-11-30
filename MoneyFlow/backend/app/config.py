from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./moneyflow.db"
    api_title: str = "MoneyFlow API"
    api_version: str = "1.0.0"
    
    class Config:
        env_file = ".env"


settings = Settings()



