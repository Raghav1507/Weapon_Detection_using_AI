# 🚀 Modern Thermal Weapon Detection System

A **professional, enterprise-grade web application** that uses YOLO (You Only Look Once) deep learning model to detect weapons in thermal images. Features modern UI/UX, real-time alerts, user authentication, and advanced analytics.

## ✨ **Key Features**

### 🔐 **Authentication System**
- **Modern login/signup** with beautiful animations
- **Password strength validation** with visual feedback
- **Session management** and secure authentication
- **User roles** and permissions

### 🎨 **Modern UI/UX**
- **Responsive design** that works on all devices
- **Smooth animations** and micro-interactions
- **Professional gradient backgrounds** with floating elements
- **Glass-morphism effects** and modern typography
- **Interactive dashboard** with real-time updates

### 🚨 **Advanced Alert System**
- **Real-time weapon detection alerts** with visual notifications
- **Sound alerts** with different tones for threat levels
- **Pop-up notifications** that auto-dismiss
- **Alert acknowledgment** and management system
- **Critical threat detection** with immediate notifications

### 📊 **Analytics & Dashboard**
- **Real-time statistics** and trend indicators
- **Detection history** with detailed results
- **User analytics** and performance metrics
- **Interactive charts** and data visualization
- **Export capabilities** for reports

### 🔍 **Detection Features**
- **YOLO model integration** with multiple loading methods
- **Drag-and-drop image upload** with preview
- **Confidence scoring** and detailed analysis
- **Database logging** of all detections
- **Batch processing** capabilities

## Features

- 🔥 **Thermal Image Processing**: Optimized for thermal imaging data
- 🎯 **Real-time Detection**: Fast weapon detection using YOLO model
- 📱 **Responsive Web Interface**: Modern, mobile-friendly UI
- 🖼️ **Image Preview**: Upload and preview images before detection
- 📊 **Detailed Results**: Confidence scores and bounding box visualization
- 🚀 **Easy Integration**: Simple Flask backend with REST API

## Project Structure

```
SIH_FINAL/
├── app.py                              # Flask backend application
├── improved_weapon_detection_10_epochs.pt  # Your trained YOLO model
├── requirements.txt                    # Python dependencies
├── README.md                          # This file
├── templates/
│   └── index.html                     # Main web interface
└── static/
    ├── style.css                      # CSS styling
    └── script.js                      # JavaScript functionality
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Your trained YOLO model file

### Step 1: Clone or Download

Download this project to your local machine.

### Step 2: Install Dependencies

```bash
# Navigate to the project directory
cd SIH_FINAL

# Install required packages
pip install -r requirements.txt
```

### Step 3: Verify Model File

Ensure your `improved_weapon_detection_10_epochs.pt` file is in the project root directory.

## Usage

### Starting the Application

```bash
# Run the Flask application
python app.py
```

The application will start on `http://localhost:5000`

### Using the Web Interface

1. **Open your browser** and navigate to `http://localhost:5000`
2. **Upload an image** by:
   - Clicking the upload area and selecting a file
   - Dragging and dropping an image onto the upload area
3. **Preview the image** to ensure it's correct
4. **Click "Detect Weapons"** to run the analysis
5. **View results** with bounding boxes and confidence scores

### API Endpoints

#### POST /predict
Upload an image for weapon detection.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: image file

**Response:**
```json
{
  "success": true,
  "detections": [
    {
      "class": "weapon",
      "confidence": 0.85,
      "bbox": [100, 150, 200, 250]
    }
  ],
  "annotated_image": "base64_encoded_image",
  "total_detections": 1
}
```

#### GET /health
Check application and model status.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

## Configuration

### Model Configuration

The application automatically loads your YOLO model on startup. If you need to modify model settings, edit the `load_model()` function in `app.py`.

### File Upload Limits

- Maximum file size: 16MB
- Supported formats: JPG, PNG, GIF, BMP, TIFF

### Performance Optimization

For better performance with large images:
1. Resize images before upload
2. Use GPU acceleration (if available)
3. Adjust batch size in model configuration

## Troubleshooting

### Common Issues

1. **Model Loading Error**
   - Ensure the model file exists and is valid
   - Check Python and PyTorch versions compatibility
   - Verify model file path in `app.py`

2. **Memory Issues**
   - Reduce image size before upload
   - Close other applications to free memory
   - Consider using a machine with more RAM

3. **Detection Not Working**
   - Check if the model is properly trained
   - Verify input image format and quality
   - Ensure the model classes match your training data

### Debug Mode

Run the application in debug mode for detailed error messages:

```bash
python app.py
```

Debug mode is enabled by default in the provided code.

## Customization

### Adding New Classes

To add new weapon types or modify detection classes:

1. Retrain your YOLO model with new classes
2. Update the class names in the `postprocess_results()` function
3. Modify the confidence threshold if needed

### UI Customization

- **Colors**: Edit `static/style.css` to change the color scheme
- **Layout**: Modify `templates/index.html` for different layouts
- **Functionality**: Update `static/script.js` for new features

### Backend Customization

- **Model Loading**: Modify `load_model()` function
- **Preprocessing**: Update `preprocess_image()` function
- **Postprocessing**: Change `postprocess_results()` function

## Performance Tips

1. **Image Optimization**:
   - Use appropriate image sizes (800x600 recommended)
   - Compress images before upload
   - Use standard formats (JPG, PNG)

2. **Model Optimization**:
   - Use GPU acceleration if available
   - Consider model quantization for faster inference
   - Implement batch processing for multiple images

3. **Server Optimization**:
   - Use a production WSGI server (Gunicorn, uWSGI)
   - Implement caching for frequently accessed images
   - Add load balancing for high traffic

## Security Considerations

- **File Upload Security**: The application validates file types and sizes
- **Input Validation**: All inputs are sanitized before processing
- **Error Handling**: Sensitive information is not exposed in error messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational and research purposes. Please ensure compliance with local laws and regulations regarding weapon detection systems.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the error logs in the console
3. Ensure all dependencies are correctly installed
4. Verify your model file is compatible

## Future Enhancements

- [ ] Real-time video processing
- [ ] Batch image processing
- [ ] Advanced filtering options
- [ ] Export results to various formats
- [ ] User authentication and management
- [ ] Database integration for result storage
- [ ] Mobile app version
- [ ] API rate limiting and monitoring

---

**Note**: This system is designed for security and surveillance purposes. Always ensure compliance with local laws and regulations when deploying weapon detection systems.
