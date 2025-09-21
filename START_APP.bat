@echo off
echo ========================================
echo  Modern Thermal Weapon Detection System
echo ========================================
echo.
echo Installing and fixing dependencies...
echo.

REM Install core dependencies
pip install flask==2.3.3
pip install werkzeug==2.3.7
pip install flask-sqlalchemy
pip install torch==2.0.1
pip install torchvision==0.15.2
pip install ultralytics==8.0.196
pip install opencv-python==4.8.1.78
pip install Pillow==10.0.1
pip install numpy==1.24.3

echo.
echo Dependencies installed successfully!
echo.
echo Starting the application...
echo.
echo 🌐 Open your browser and go to: http://localhost:5000
echo.
echo Default admin login:
echo Username: admin
echo Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py
pause
