@echo off
REM ===== OT Overview - regenerate site content from the Data Entry workbook =====
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python is not installed. Install it from https://www.python.org/downloads/ ^(tick "Add to PATH"^), then run this again.
  pause
  exit /b
)
echo Installing/refreshing the one helper library ^(openpyxl^)...
python -m pip install --quiet openpyxl
echo.
echo Reading the workbook and rebuilding the site content...
python build_site_data.py
echo.
echo ============================================================
echo  Done. Now open GitHub Desktop, write a short summary,
echo  click Commit to main, then Push origin to publish.
echo  Your live site updates about 30 seconds after pushing.
echo ============================================================
pause
