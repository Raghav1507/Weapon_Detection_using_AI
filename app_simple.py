from flask import Flask, request, jsonify, render_template
import torch
import cv2
import numpy as np
from PIL import Image
import base64
import os

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Global model variable
model = None
model_path = 'improved_weapon_detection_10_epochs.pt'

def load_model():
    global model
    try:
        print(f"Attempting to load model from: {model_path}")
        
        # Check if file exists
        if not os.path.exists(model_path):
            print(f"❌ Model file not found: {model_path}")
            return False
        
        # Try ultralytics first (most reliable)
        try:
            from ultralytics import YOLO
            model = YOLO(model_path)
            print("✅ Model loaded successfully using ultralytics")
            return True
        except Exception as e:
            print(f"❌ ultralytics failed: {e}")
        
        # Fallback to torch.hub
        try:
            model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path, force_reload=True)
            print("✅ Model loaded successfully using torch.hub")
            return True
        except Exception as e:
            print(f"❌ torch.hub failed: {e}")
        
        # Last resort: direct torch.load
        try:
            checkpoint = torch.load(model_path, map_location='cpu')
            if isinstance(checkpoint, dict) and 'model' in checkpoint:
                # Load base YOLOv5 and load state dict
                base_model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=False)
                base_model.load_state_dict(checkpoint['model'].state_dict())
                model = base_model
                print("✅ Model loaded successfully using direct torch.load")
                return True
            else:
                model = checkpoint
                print("✅ Model loaded successfully using direct torch.load (complete model)")
                return True
        except Exception as e:
            print(f"❌ Direct torch.load failed: {e}")
        
        print("❌ All loading methods failed!")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def predict_image(image_array):
    """Run prediction on image array"""
    try:
        if hasattr(model, 'predict'):  # ultralytics
            results = model.predict(image_array, verbose=False)
            return process_ultralytics_results(results, image_array)
        else:  # torch.hub
            results = model(image_array)
            return process_torch_hub_results(results, image_array)
    except Exception as e:
        print(f"Prediction error: {e}")
        return None, []

def process_ultralytics_results(results, original_image):
    """Process ultralytics results"""
    result = results[0]
    annotated_img = original_image.copy()
    detections = []
    
    if result.boxes is not None and len(result.boxes) > 0:
        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()
        class_ids = result.boxes.cls.cpu().numpy().astype(int)
        
        for box, confidence, class_id in zip(boxes, confidences, class_ids):
            x1, y1, x2, y2 = box
            class_name = result.names[class_id] if hasattr(result, 'names') else f"Class_{class_id}"
            
            # Draw bounding box
            cv2.rectangle(annotated_img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
            cv2.putText(annotated_img, f"{class_name}: {confidence:.2f}", 
                       (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            detections.append({
                'class': class_name,
                'confidence': float(confidence),
                'bbox': [int(x1), int(y1), int(x2), int(y2)]
            })
    
    return annotated_img, detections

def process_torch_hub_results(results, original_image):
    """Process torch.hub results"""
    result = results[0]
    annotated_img = original_image.copy()
    detections = []
    
    if len(result.boxes) > 0:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            confidence = box.conf[0].cpu().numpy()
            class_id = int(box.cls[0].cpu().numpy())
            class_name = result.names[class_id] if hasattr(result, 'names') else f"Class_{class_id}"
            
            # Draw bounding box
            cv2.rectangle(annotated_img, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
            cv2.putText(annotated_img, f"{class_name}: {confidence:.2f}", 
                       (int(x1), int(y1) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            
            detections.append({
                'class': class_name,
                'confidence': float(confidence),
                'bbox': [int(x1), int(y1), int(x2), int(y2)]
            })
    
    return annotated_img, detections

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image selected'}), 400
        
        # Load model if not loaded
        if model is None:
            if not load_model():
                return jsonify({'error': 'Failed to load model. Please check the console for details.'}), 500
        
        # Process image
        image = Image.open(file.stream)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array
        img_array = np.array(image)
        if len(img_array.shape) == 3:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # Run prediction
        annotated_img, detections = predict_image(img_array)
        
        if annotated_img is None:
            return jsonify({'error': 'Prediction failed'}), 500
        
        # Convert to base64
        _, buffer = cv2.imencode('.jpg', annotated_img)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'detections': detections,
            'annotated_image': img_base64,
            'total_detections': len(detections)
        })
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy', 
        'model_loaded': model is not None,
        'model_path': model_path,
        'model_exists': os.path.exists(model_path)
    })

if __name__ == '__main__':
    print("Starting Thermal Weapon Detection System...")
    print("Loading model...")
    
    if load_model():
        print("✅ Model loaded successfully!")
        print("Starting Flask server...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("❌ Failed to load model!")
        print("Please run 'python test_model.py' to diagnose the issue.")
        print("Starting server anyway for testing...")
        app.run(debug=True, host='0.0.0.0', port=5000)
