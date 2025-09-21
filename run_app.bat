@echo off
echo Starting Thermal Weapon Detection System...
echo.
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Testing model loading...
python test_model.py
echo.
echo Starting Flask application...
echo Open your browser and go to: http://localhost:5000
echo.
echo If model loading fails, try running: python app_simple.py
echo.
python app.py
pause
