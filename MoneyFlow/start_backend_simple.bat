@echo off
cd /d "%~dp0backend"
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
venv\Scripts\python.exe -c "import fastapi" 2>nul
if errorlevel 1 (
    echo Installing dependencies...
    venv\Scripts\python.exe -m pip install fastapi uvicorn[standard] sqlalchemy pydantic pydantic-settings python-dateutil alembic python-multipart
)
echo Starting backend server...
venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
pause



