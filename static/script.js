// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewSection = document.getElementById('previewSection');
const previewImage = document.getElementById('previewImage');
const detectBtn = document.getElementById('detectBtn');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const detectionCount = document.getElementById('detectionCount');
const confidenceInfo = document.getElementById('confidenceInfo');
const resultImage = document.getElementById('resultImage');
const errorText = document.getElementById('errorText');

// State
let selectedFile = null;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    // File input change
    imageInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => imageInput.click());
    
    // Detect button
    detectBtn.addEventListener('click', handleDetection);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);
    } else {
        showError('Please select a valid image file.');
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            processFile(file);
        } else {
            showError('Please drop a valid image file.');
        }
    }
}

function processFile(file) {
    selectedFile = file;
    
    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
        showError('File size too large. Please select an image smaller than 16MB.');
        return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        showPreview();
    };
    reader.readAsDataURL(file);
}

function showPreview() {
    hideAllSections();
    previewSection.style.display = 'block';
    previewSection.classList.add('fade-in');
}

function showLoading() {
    hideAllSections();
    loadingSection.style.display = 'block';
    loadingSection.classList.add('fade-in');
}

function showResults(data) {
    hideAllSections();
    
    // Update detection count
    detectionCount.textContent = data.total_detections;
    
    // Update confidence info
    updateConfidenceInfo(data.detections);
    
    // Show result image
    resultImage.src = 'data:image/jpeg;base64,' + data.annotated_image;
    
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
}

function updateConfidenceInfo(detections) {
    if (detections.length === 0) {
        confidenceInfo.innerHTML = '<p style="text-align: center; color: #666;">No weapons detected in the image.</p>';
        return;
    }
    
    let html = '<h4>Detection Details:</h4>';
    detections.forEach((detection, index) => {
        html += `
            <div class="confidence-item">
                <span class="confidence-label">${detection.class}</span>
                <span class="confidence-value">${(detection.confidence * 100).toFixed(1)}%</span>
            </div>
        `;
    });
    
    confidenceInfo.innerHTML = html;
}

function showError(message) {
    hideAllSections();
    errorText.textContent = message;
    errorSection.style.display = 'block';
    errorSection.classList.add('fade-in');
}

function hideAllSections() {
    previewSection.style.display = 'none';
    loadingSection.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    
    // Remove animation classes
    previewSection.classList.remove('fade-in');
    loadingSection.classList.remove('fade-in');
    resultsSection.classList.remove('fade-in');
    errorSection.classList.remove('fade-in');
}

async function handleDetection() {
    if (!selectedFile) {
        showError('Please select an image first.');
        return;
    }
    
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showResults(data);
        } else {
            showError(data.error || 'Detection failed. Please try again.');
        }
    } catch (error) {
        console.error('Detection error:', error);
        showError('Network error. Please check your connection and try again.');
    }
}

function resetDetection() {
    selectedFile = null;
    imageInput.value = '';
    hideAllSections();
    
    // Reset preview image
    previewImage.src = '';
    
    // Reset results
    detectionCount.textContent = '0';
    confidenceInfo.innerHTML = '';
    resultImage.src = '';
}

// Utility function to check if model is loaded
async function checkModelStatus() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        
        if (!data.model_loaded) {
            console.warn('Model not loaded yet. Detection may fail.');
        }
    } catch (error) {
        console.error('Health check failed:', error);
    }
}

// Check model status on page load
checkModelStatus();

// Add some visual feedback for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Add loading animation to detect button
    detectBtn.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
        this.disabled = true;
        
        // Re-enable button after a delay (in case of error)
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-search"></i> Detect Weapons';
            this.disabled = false;
        }, 10000);
    });
    
    // Add hover effects
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + O to open file dialog
    if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
        event.preventDefault();
        imageInput.click();
    }
    
    // Enter key to start detection when preview is shown
    if (event.key === 'Enter' && previewSection.style.display === 'block') {
        handleDetection();
    }
    
    // Escape key to reset
    if (event.key === 'Escape') {
        resetDetection();
    }
});
