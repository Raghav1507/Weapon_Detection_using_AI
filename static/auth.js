// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Password strength checker
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }
    
    // Form validation
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', validateSignupForm);
    }
    
    // Password confirmation
    const confirmPasswordInput = document.getElementById('confirm_password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
    
    // Add floating label effect
    addFloatingLabels();
    
    // Add form animations
    addFormAnimations();
}

function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    let strength = 0;
    let strengthLabel = '';
    
    // Length check
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 12.5;
    if (/[A-Z]/.test(password)) strength += 12.5;
    if (/[0-9]/.test(password)) strength += 12.5;
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    
    // Update UI
    strengthFill.style.width = strength + '%';
    strengthFill.className = 'strength-fill';
    
    if (strength < 30) {
        strengthLabel = 'Weak';
        strengthFill.classList.add('weak');
    } else if (strength < 60) {
        strengthLabel = 'Medium';
        strengthFill.classList.add('medium');
    } else {
        strengthLabel = 'Strong';
        strengthFill.classList.add('strong');
    }
    
    strengthText.textContent = strengthLabel;
}

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const confirmInput = document.getElementById('confirm_password');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmInput.setCustomValidity('Passwords do not match');
        confirmInput.style.borderColor = '#f56565';
    } else {
        confirmInput.setCustomValidity('');
        confirmInput.style.borderColor = '#e2e8f0';
    }
}

function validateSignupForm(event) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const terms = document.querySelector('input[name="terms"]');
    
    let isValid = true;
    
    // Check password match
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        isValid = false;
    }
    
    // Check password strength
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        isValid = false;
    }
    
    // Check terms agreement
    if (!terms.checked) {
        showError('Please agree to the Terms of Service and Privacy Policy');
        isValid = false;
    }
    
    if (!isValid) {
        event.preventDefault();
    }
}

function togglePassword(inputId = 'password') {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function addFloatingLabels() {
    const inputs = document.querySelectorAll('.form-group input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input has value on load
        if (input.value !== '') {
            input.parentElement.classList.add('focused');
        }
    });
}

function addFormAnimations() {
    const formGroups = document.querySelectorAll('.form-group');
    
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1}s`;
        group.classList.add('fade-in-up');
    });
}

function showError(message) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.alert-error');
    existingErrors.forEach(error => error.remove());
    
    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${message}
    `;
    
    // Insert after form subtitle
    const formSubtitle = document.querySelector('.form-subtitle');
    if (formSubtitle) {
        formSubtitle.insertAdjacentElement('afterend', errorDiv);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 5000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .form-group {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .form-group.focused label {
        color: #667eea;
        transform: translateY(-2px);
    }
    
    .form-group.focused input {
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .btn:active {
        transform: scale(0.98);
    }
    
    .form-group input:invalid {
        border-color: #f56565;
    }
    
    .form-group input:valid {
        border-color: #48bb78;
    }
`;
document.head.appendChild(style);
