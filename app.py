from flask import Flask, request, jsonify, render_template, redirect, url_for, session, flash, send_file
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import torch
import cv2
import numpy as np
from PIL import Image
import io
import base64
import os
import json
import uuid
from werkzeug.utils import secure_filename

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///weapon_detection.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize database
db = SQLAlchemy(app)

# Add custom Jinja2 filter for JSON parsing
@app.template_filter('from_json')
def from_json_filter(json_string):
    """Convert JSON string to Python object"""
    try:
        return json.loads(json_string)
    except (json.JSONDecodeError, TypeError):
        return []

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)

class Detection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    image_path = db.Column(db.String(200), nullable=False)
    detections = db.Column(db.Text, nullable=False)  # JSON string
    confidence_scores = db.Column(db.Text, nullable=False)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    alert_sent = db.Column(db.Boolean, default=False)

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    detection_id = db.Column(db.Integer, db.ForeignKey('detection.id'), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False)  # 'weapon_detected', 'high_confidence', etc.
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    acknowledged = db.Column(db.Boolean, default=False)

# Load your YOLO model
model_path = 'improved_weapon_detection_10_epochs.pt'
model = None

def load_model():
    global model
    try:
        # Check if model file exists
        if not os.path.exists(model_path):
            print(f"Model file not found: {model_path}")
            return False
        
        print(f"Loading model from: {model_path}")
        
        # Try different loading methods
        try:
            # Method 1: Direct torch.load for custom models
            checkpoint = torch.load(model_path, map_location='cpu')
            print("Model loaded using torch.load method")
            
            # If it's a state dict, we need to create the model architecture first
            if isinstance(checkpoint, dict) and 'model' in checkpoint:
                # This is a YOLOv5 checkpoint
                model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=False)
                model.load_state_dict(checkpoint['model'].state_dict())
            else:
                # Try to load as a complete model
                model = checkpoint
                
        except Exception as e1:
            print(f"Method 1 failed: {e1}")
            try:
                # Method 2: Using ultralytics YOLO
                from ultralytics import YOLO
                model = YOLO(model_path)
                print("Model loaded using ultralytics YOLO method")
            except Exception as e2:
                print(f"Method 2 failed: {e2}")
                try:
                    # Method 3: Using torch.hub with custom path
                    model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path, force_reload=True)
                    print("Model loaded using torch.hub method")
                except Exception as e3:
                    print(f"Method 3 failed: {e3}")
                    raise Exception(f"All loading methods failed. Last error: {e3}")
        
        # Set model to evaluation mode
        if hasattr(model, 'eval'):
            model.eval()
        
        print("Model loaded successfully!")
        print(f"Model type: {type(model)}")
        return True
        
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Please ensure:")
        print("1. The model file exists and is valid")
        print("2. You have the required dependencies installed")
        print("3. The model is compatible with the current PyTorch version")
        return False

def preprocess_image(image):
    """Convert PIL image to format suitable for YOLO"""
    # Convert PIL to OpenCV format
    img_array = np.array(image)
    if len(img_array.shape) == 3:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    return img_array

def postprocess_results(results, original_image):
    """Process YOLO results and create annotated image"""
    # Get the first result (assuming single image)
    result = results[0]
    
    # Create a copy of the original image for annotation
    annotated_img = original_image.copy()
    
    # Get detection results
    detections = []
    if len(result.boxes) > 0:
        for i, box in enumerate(result.boxes):
            # Extract box coordinates
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            confidence = box.conf[0].cpu().numpy()
            class_id = int(box.cls[0].cpu().numpy())
            
            # Get class name (you may need to adjust this based on your model's classes)
            class_name = result.names[class_id] if hasattr(result, 'names') else f"Class_{class_id}"
            
            # Draw bounding box
            cv2.rectangle(annotated_img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
            
            # Draw label
            label = f"{class_name}: {confidence:.2f}"
            cv2.putText(annotated_img, label, (int(x1), int(y1) - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            detections.append({
                'class': class_name,
                'confidence': float(confidence),
                'bbox': [int(x1), int(y1), int(x2), int(y2)]
            })
    
    return annotated_img, detections

def postprocess_ultralytics_results(results, original_image):
    """Process ultralytics YOLO results and create annotated image"""
    # Get the first result
    result = results[0]
    
    # Create a copy of the original image for annotation
    annotated_img = original_image.copy()
    
    # Get detection results
    detections = []
    if result.boxes is not None and len(result.boxes) > 0:
        boxes = result.boxes.xyxy.cpu().numpy()  # Get boxes
        confidences = result.boxes.conf.cpu().numpy()  # Get confidences
        class_ids = result.boxes.cls.cpu().numpy().astype(int)  # Get class IDs
        
        for i, (box, confidence, class_id) in enumerate(zip(boxes, confidences, class_ids)):
            x1, y1, x2, y2 = box
            
            # Get class name
            class_name = result.names[class_id] if hasattr(result, 'names') else f"Class_{class_id}"
            
            # Draw bounding box
            cv2.rectangle(annotated_img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
            
            # Draw label
            label = f"{class_name}: {confidence:.2f}"
            cv2.putText(annotated_img, label, (int(x1), int(y1) - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            detections.append({
                'class': class_name,
                'confidence': float(confidence),
                'bbox': [int(x1), int(y1), int(x2), int(y2)]
            })
    
    return annotated_img, detections

# Authentication routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['is_admin'] = user.is_admin
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists', 'error')
            return render_template('signup.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'error')
            return render_template('signup.html')
        
        # Create new user
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
        
        flash('Account created successfully! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logged out successfully', 'info')
    return redirect(url_for('login'))

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # Get user's recent detections
    recent_detections = Detection.query.filter_by(user_id=session['user_id']).order_by(Detection.timestamp.desc()).limit(10).all()
    
    # Get statistics
    total_detections = Detection.query.filter_by(user_id=session['user_id']).count()
    weapon_detections = Detection.query.filter(Detection.detections != '[]').count()
    
    # Get recent alerts
    recent_alerts = Alert.query.join(Detection).filter(Detection.user_id == session['user_id']).order_by(Alert.timestamp.desc()).limit(5).all()
    
    return render_template('dashboard.html', 
                         recent_detections=recent_detections,
                         total_detections=total_detections,
                         weapon_detections=weapon_detections,
                         recent_alerts=recent_alerts)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Load model if not already loaded
        if model is None:
            if not load_model():
                return jsonify({'error': 'Failed to load model'}), 500
        
        # Read and preprocess image
        image = Image.open(file.stream)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Preprocess for YOLO
        img_array = preprocess_image(image)
        
        # Run inference based on model type
        with torch.no_grad():
            if hasattr(model, 'predict'):  # ultralytics YOLO
                results = model.predict(img_array, verbose=False)
                annotated_img, detections = postprocess_ultralytics_results(results, img_array)
            else:  # torch.hub YOLO
                results = model(img_array)
                annotated_img, detections = postprocess_results(results, img_array)
        
        # Save annotated image
        unique_filename = f"detection_{uuid.uuid4().hex}.jpg"
        image_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        cv2.imwrite(image_path, annotated_img)
        
        # Save detection to database
        detection = Detection(
            user_id=session['user_id'],
            image_path=unique_filename,
            detections=json.dumps(detections),
            confidence_scores=json.dumps([d['confidence'] for d in detections])
        )
        db.session.add(detection)
        db.session.commit()
        
        # Check for weapons and create alerts
        alerts_created = []
        if detections:
            # Create weapon detection alert
            alert = Alert(
                detection_id=detection.id,
                alert_type='weapon_detected',
                message=f'Weapon detected with {len(detections)} object(s) found'
            )
            db.session.add(alert)
            alerts_created.append({
                'type': 'weapon_detected',
                'message': f'🚨 WEAPON DETECTED! {len(detections)} object(s) found',
                'severity': 'high'
            })
            
            # Check for high confidence detections
            high_confidence = [d for d in detections if d['confidence'] > 0.8]
            if high_confidence:
                alert = Alert(
                    detection_id=detection.id,
                    alert_type='high_confidence',
                    message=f'High confidence weapon detection: {len(high_confidence)} object(s) with >80% confidence'
                )
                db.session.add(alert)
                alerts_created.append({
                    'type': 'high_confidence',
                    'message': f'⚠️ HIGH CONFIDENCE: {len(high_confidence)} weapon(s) detected with >80% confidence',
                    'severity': 'critical'
                })
        
        db.session.commit()
        
        # Convert annotated image back to base64 for web display
        _, buffer = cv2.imencode('.jpg', annotated_img)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'detections': detections,
            'annotated_image': img_base64,
            'total_detections': len(detections),
            'alerts': alerts_created,
            'detection_id': detection.id
        })
        
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

@app.route('/image/<filename>')
def serve_image(filename):
    """Serve detection images"""
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # Verify the image belongs to the current user
    detection = Detection.query.filter_by(image_path=filename, user_id=session['user_id']).first()
    if not detection:
        return "Image not found or access denied", 404
    
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(image_path):
        return send_file(image_path, mimetype='image/jpeg')
    else:
        return "Image file not found", 404

# Additional routes
@app.route('/alerts')
def alerts():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    alerts = Alert.query.join(Detection).filter(Detection.user_id == session['user_id']).order_by(Alert.timestamp.desc()).all()
    return render_template('alerts.html', alerts=alerts)

@app.route('/detection/<int:detection_id>')
def view_detection(detection_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    detection = Detection.query.filter_by(id=detection_id, user_id=session['user_id']).first_or_404()
    return render_template('detection_detail.html', detection=detection)

@app.route('/api/alerts')
def api_alerts():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    alerts = Alert.query.join(Detection).filter(
        Detection.user_id == session['user_id'],
        Alert.acknowledged == False
    ).order_by(Alert.timestamp.desc()).limit(10).all()
    
    return jsonify([{
        'id': alert.id,
        'type': alert.alert_type,
        'message': alert.message,
        'timestamp': alert.timestamp.isoformat(),
        'severity': 'high' if alert.alert_type == 'weapon_detected' else 'critical'
    } for alert in alerts])

@app.route('/api/acknowledge_alert/<int:alert_id>', methods=['POST'])
def acknowledge_alert(alert_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    alert = Alert.query.join(Detection).filter(
        Alert.id == alert_id,
        Detection.user_id == session['user_id']
    ).first_or_404()
    
    alert.acknowledged = True
    db.session.commit()
    
    return jsonify({'success': True})

if __name__ == '__main__':
    # Create database tables
    with app.app_context():
        db.create_all()
        
        # Create admin user if it doesn't exist
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@weapondetection.com',
                password_hash=generate_password_hash('admin123'),
                is_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created: username=admin, password=admin123")
    
    # Load model on startup
    load_model()
    app.run(debug=True, host='0.0.0.0', port=5000)
