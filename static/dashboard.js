// Dashboard JavaScript with Alert System
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    setupImageUpload();
    setupAlertSystem();
    setupModal();
    loadRecentAlerts();
    
    // Auto-refresh alerts every 30 seconds
    setInterval(loadRecentAlerts, 30000);
}

// Image Upload and Detection
function setupImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const modalUploadArea = document.getElementById('modalUploadArea');
    const modalImageInput = document.getElementById('modalImageInput');
    
    // Main upload area
    if (uploadArea && imageInput) {
        setupUploadHandlers(uploadArea, imageInput, 'main');
    }
    
    // Modal upload area
    if (modalUploadArea && modalImageInput) {
        setupUploadHandlers(modalUploadArea, modalImageInput, 'modal');
    }
}

function setupUploadHandlers(uploadArea, imageInput, type) {
    // Click to upload
    uploadArea.addEventListener('click', () => imageInput.click());
    
    // File input change
    imageInput.addEventListener('change', (e) => handleFileSelect(e, type));
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', (e) => handleDrop(e, imageInput, type));
}

function handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file, type);
    } else {
        showError('Please select a valid image file.');
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
}

function handleDrop(event, imageInput, type) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            imageInput.files = files;
            processFile(file, type);
        } else {
            showError('Please drop a valid image file.');
        }
    }
}

function processFile(file, type) {
    // Validate file size (16MB max)
    if (file.size > 16 * 1024 * 1024) {
        showError('File size too large. Please select an image smaller than 16MB.');
        return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = function(e) {
        if (type === 'modal') {
            closeDetectionModal();
        }
        showImagePreview(e.target.result, type);
        runDetection(file, type);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(imageSrc, type) {
    const previewImg = type === 'modal' ? 
        document.getElementById('modalResultImage') : 
        document.getElementById('resultImage');
    
    if (previewImg) {
        previewImg.src = imageSrc;
    }
}

function runDetection(file, type) {
    const progressDiv = type === 'modal' ? 
        document.getElementById('detectionProgress') : 
        document.getElementById('detectionResults');
    
    if (progressDiv) {
        progressDiv.style.display = 'block';
        progressDiv.classList.add('fade-in');
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showDetectionResults(data, type);
            handleAlerts(data.alerts);
        } else {
            showError(data.error || 'Detection failed. Please try again.');
        }
    })
    .catch(error => {
        console.error('Detection error:', error);
        showError('Network error. Please check your connection and try again.');
    })
    .finally(() => {
        if (progressDiv) {
            progressDiv.style.display = 'none';
        }
    });
}

function showDetectionResults(data, type) {
    const resultsDiv = type === 'modal' ? 
        document.getElementById('modalDetectionResults') : 
        document.getElementById('detectionResults');
    
    const countElement = type === 'modal' ? 
        document.getElementById('modalDetectionCount') : 
        document.getElementById('detectionCount');
    
    const confidenceList = type === 'modal' ? 
        document.getElementById('modalConfidenceList') : 
        document.getElementById('confidenceList');
    
    if (resultsDiv) {
        resultsDiv.style.display = 'block';
        resultsDiv.classList.add('fade-in');
    }
    
    if (countElement) {
        countElement.textContent = data.total_detections;
    }
    
    if (confidenceList) {
        updateConfidenceList(confidenceList, data.detections);
    }
    
    // Update result image
    const resultImg = type === 'modal' ? 
        document.getElementById('modalResultImage') : 
        document.getElementById('resultImage');
    
    if (resultImg) {
        resultImg.src = 'data:image/jpeg;base64,' + data.annotated_image;
    }
}

function updateConfidenceList(container, detections) {
    if (detections.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No weapons detected in the image.</p>';
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
    
    container.innerHTML = html;
}

// Alert System
function setupAlertSystem() {
    // Check for alerts on page load
    loadRecentAlerts();
    
    // Setup alert notification
    setupAlertNotification();
}

function loadRecentAlerts() {
    fetch('/api/alerts')
    .then(response => response.json())
    .then(alerts => {
        updateAlertBadge(alerts.length);
        updateAlertsList(alerts);
    })
    .catch(error => {
        console.error('Error loading alerts:', error);
    });
}

function updateAlertBadge(count) {
    const badge = document.getElementById('alertBadge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline' : 'none';
    }
}

function updateAlertsList(alerts) {
    // This would update the alerts panel in real-time
    // Implementation depends on your specific UI structure
}

function handleAlerts(alerts) {
    if (alerts && alerts.length > 0) {
        alerts.forEach(alert => {
            showAlertNotification(alert);
            playAlertSound(alert.severity);
        });
    }
}

function showAlertNotification(alert) {
    const notification = document.getElementById('alertNotification');
    const message = document.getElementById('alertMessage');
    
    if (notification && message) {
        message.textContent = alert.message;
        notification.style.display = 'block';
        notification.classList.add('show');
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            closeAlert();
        }, 10000);
    }
}

function closeAlert() {
    const notification = document.getElementById('alertNotification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }
}

function playAlertSound(severity) {
    // Create audio context for sound alerts
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    if (severity === 'critical') {
        // High-pitched alert for critical threats
        playTone(audioContext, 800, 0.3);
        setTimeout(() => playTone(audioContext, 1000, 0.3), 200);
        setTimeout(() => playTone(audioContext, 1200, 0.3), 400);
    } else if (severity === 'high') {
        // Medium alert for weapon detection
        playTone(audioContext, 600, 0.5);
        setTimeout(() => playTone(audioContext, 800, 0.5), 300);
    }
}

function playTone(audioContext, frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Modal Functions
function setupModal() {
    const modal = document.getElementById('detectionModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeDetectionModal();
            }
        });
    }
}

function openDetectionModal() {
    const modal = document.getElementById('detectionModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeDetectionModal() {
    const modal = document.getElementById('detectionModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Clear modal content
        const progress = document.getElementById('detectionProgress');
        const results = document.getElementById('modalDetectionResults');
        if (progress) progress.style.display = 'none';
        if (results) results.style.display = 'none';
    }
}

// Utility Functions
function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert-notification error';
    errorDiv.innerHTML = `
        <div class="alert-content">
            <div class="alert-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="alert-message">
                <h4>Error</h4>
                <p>${message}</p>
            </div>
            <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

function acknowledgeAlert(alertId) {
    // Get the button and alert card elements
    const button = document.getElementById(`ack-btn-${alertId}`);
    const alertCard = document.getElementById(`alert-${alertId}`);
    
    // Disable button and show loading state
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Accepting...';
    }
    
    fetch(`/api/acknowledge_alert/${alertId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success state briefly
            if (button) {
                button.innerHTML = '<i class="fas fa-check"></i> Accepted';
                button.classList.remove('btn-primary');
                button.classList.add('btn-success');
            }
            
            // Add fade out animation
            if (alertCard) {
                alertCard.style.transition = 'all 0.5s ease';
                alertCard.style.opacity = '0';
                alertCard.style.transform = 'translateX(-100%)';
                
                // Remove from DOM after animation
                setTimeout(() => {
                    alertCard.remove();
                    
                    // Update alert badge count
                    updateAlertBadge();
                    
                    // Check if no alerts left
                    const remainingAlerts = document.querySelectorAll('.alert-card');
                    if (remainingAlerts.length === 0) {
                        showNoAlertsMessage();
                    }
                }, 500);
            }
        } else {
            // Show error state
            if (button) {
                button.innerHTML = '<i class="fas fa-times"></i> Error';
                button.classList.remove('btn-primary');
                button.classList.add('btn-danger');
                button.disabled = false;
            }
            console.error('Error acknowledging alert:', data.error);
        }
    })
    .catch(error => {
        console.error('Error acknowledging alert:', error);
        // Show error state
        if (button) {
            button.innerHTML = '<i class="fas fa-times"></i> Error';
            button.classList.remove('btn-primary');
            button.classList.add('btn-danger');
            button.disabled = false;
        }
    });
}

function updateAlertBadge() {
    const alertBadge = document.getElementById('alertBadge');
    if (alertBadge) {
        const remainingAlerts = document.querySelectorAll('.alert-card');
        const count = remainingAlerts.length;
        alertBadge.textContent = count;
        
        if (count === 0) {
            alertBadge.style.display = 'none';
        }
    }
}

function showNoAlertsMessage() {
    const alertsContainer = document.querySelector('.alerts-container');
    if (alertsContainer) {
        alertsContainer.innerHTML = `
            <div class="no-alerts">
                <i class="fas fa-check-circle"></i>
                <h3>No Alerts</h3>
                <p>All clear! No security alerts at this time.</p>
            </div>
        `;
    }
}

function downloadResult() {
    const resultImg = document.getElementById('resultImage');
    if (resultImg) {
        const link = document.createElement('a');
        link.download = 'weapon_detection_result.jpg';
        link.href = resultImg.src;
        link.click();
    }
}

function clearResults() {
    const resultsDiv = document.getElementById('detectionResults');
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
    }
    
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.value = '';
    }
}

function viewAlerts() {
    window.location.href = '/alerts';
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeIn 0.5s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .alert-notification.error {
        background: #f56565;
    }
    
    .alert-notification.error .alert-icon {
        color: white;
    }
`;
document.head.appendChild(style);
