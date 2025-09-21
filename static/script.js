// Modern Weapon Detection System JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeAnimations();
    initializeParallax();
});

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
const detectionStatus = document.getElementById('detectionStatus');

// State
let selectedFile = null;
let isProcessing = false;

function initializeApp() {
    initializeEventListeners();
    addModernInteractions();
    initializeProgressBar();
}

function initializeAnimations() {
    // Stagger animation for hero elements
    const heroElements = document.querySelectorAll('.hero-content > *');
    heroElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.2}s`;
        element.classList.add('fade-in-up');
    });
    
    // Animate stats
    const stats = document.querySelectorAll('.stat');
    stats.forEach((stat, index) => {
        stat.style.animationDelay = `${index * 0.1}s`;
        stat.classList.add('scale-in');
    });
}

function initializeParallax() {
    const shapes = document.querySelectorAll('.shape');
    const particles = document.querySelectorAll('.particle');
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        particles.forEach((particle, index) => {
            const speed = (index + 1) * 0.3;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            particle.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

function addModernInteractions() {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.btn, button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            addRippleEffect(this, e);
        });
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.stat, .upload-area, .detection-info');
    cards.forEach(card => {
        card.classList.add('hover-lift');
    });
    
    // Add glow effect to interactive elements
    const interactiveElements = document.querySelectorAll('.upload-btn, .detect-btn');
    interactiveElements.forEach(element => {
        element.classList.add('hover-glow');
    });
}

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
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window events
    window.addEventListener('resize', handleResize);
}

function initializeProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        // Simulate progress during loading
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            progressFill.style.width = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 200);
    }
}

function addRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + O to open file dialog
    if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
        event.preventDefault();
        imageInput.click();
    }
    
    // Enter key to start detection when preview is shown
    if (event.key === 'Enter' && previewSection.style.display === 'block' && !isProcessing) {
        handleDetection();
    }
    
    // Escape key to reset
    if (event.key === 'Escape') {
        resetDetection();
    }
}

function handleResize() {
    // Recalculate parallax positions on resize
    const shapes = document.querySelectorAll('.shape');
    const particles = document.querySelectorAll('.particle');
    
    shapes.forEach(shape => {
        shape.style.transform = '';
    });
    
    particles.forEach(particle => {
        particle.style.transform = '';
    });
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
    
    // Update detection count with animation
    animateCounter(detectionCount, 0, data.total_detections, 1000);
    
    // Update detection status
    updateDetectionStatus(data.total_detections);
    
    // Update confidence info
    updateConfidenceInfo(data.detections);
    
    // Show result image with fade effect
    resultImage.style.opacity = '0';
    resultImage.src = 'data:image/jpeg;base64,' + data.annotated_image;
    resultImage.onload = () => {
        resultImage.style.transition = 'opacity 0.5s ease';
        resultImage.style.opacity = '1';
    };
    
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
    
    // Add success animation
    setTimeout(() => {
        resultsSection.classList.add('scale-in');
    }, 100);
}

function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function updateDetectionStatus(count) {
    if (detectionStatus) {
        if (count > 0) {
            detectionStatus.className = 'detection-status danger';
            detectionStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Threat Detected</span>';
        } else {
            detectionStatus.className = 'detection-status safe';
            detectionStatus.innerHTML = '<i class="fas fa-shield-alt"></i><span>Safe</span>';
        }
    }
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
    
    if (isProcessing) {
        return;
    }
    
    isProcessing = true;
    showLoading();
    
    // Update button state
    const btnText = detectBtn.querySelector('span');
    const btnIcon = detectBtn.querySelector('i');
    const originalText = btnText.textContent;
    const originalIcon = btnIcon.className;
    
    btnText.textContent = 'Analyzing...';
    btnIcon.className = 'fas fa-spinner fa-spin';
    detectBtn.disabled = true;
    
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
    } finally {
        // Reset button state
        btnText.textContent = originalText;
        btnIcon.className = originalIcon;
        detectBtn.disabled = false;
        isProcessing = false;
    }
}

function resetDetection() {
    selectedFile = null;
    imageInput.value = '';
    isProcessing = false;
    hideAllSections();
    
    // Reset preview image
    previewImage.src = '';
    
    // Reset results
    detectionCount.textContent = '0';
    confidenceInfo.innerHTML = '';
    resultImage.src = '';
    
    // Reset detection status
    if (detectionStatus) {
        detectionStatus.className = 'detection-status safe';
        detectionStatus.innerHTML = '<i class="fas fa-shield-alt"></i><span>Safe</span>';
    }
    
    // Reset button state
    const btnText = detectBtn.querySelector('span');
    const btnIcon = detectBtn.querySelector('i');
    btnText.textContent = 'Detect Weapons';
    btnIcon.className = 'fas fa-search';
    detectBtn.disabled = false;
}

function resetUpload() {
    resetDetection();
}

function downloadResult() {
    if (resultImage.src) {
        const link = document.createElement('a');
        link.download = 'weapon_detection_result.jpg';
        link.href = resultImage.src;
        link.click();
    }
}

function shareResult() {
    if (navigator.share && resultImage.src) {
        navigator.share({
            title: 'Weapon Detection Result',
            text: 'Check out this weapon detection result',
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('Link copied to clipboard!');
        }).catch(console.error);
    }
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

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
