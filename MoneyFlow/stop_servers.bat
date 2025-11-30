@echo off
echo Остановка серверов MoneyFlow...
echo.

echo Остановка frontend сервера (порт 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo Завершение процесса %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo Остановка backend сервера (порт 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Завершение процесса %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Все серверы остановлены.
echo Данные сохранены в базе данных: backend\moneyflow.db
echo.
pause



