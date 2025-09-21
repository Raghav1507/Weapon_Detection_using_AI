// Modern Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    initializeAnimations();
    initializeFormInteractions();
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
    
    // Initialize login form
    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

function initializeAnimations() {
    // Stagger animation for form elements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1}s`;
        group.classList.add('fade-in-up');
    });
    
    // Animate features
    const features = document.querySelectorAll('.feature');
    features.forEach((feature, index) => {
        feature.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Add mouse parallax effect
    addParallaxEffect();
}

function initializeFormInteractions() {
    // Enhanced input interactions
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
            addRippleEffect(this);
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value) {
                this.parentElement.classList.add('has-value');
            } else {
                this.parentElement.classList.remove('has-value');
            }
        });
    });
    
    // Button interactions
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            addRippleEffect(this, e);
        });
    });
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
    const button = input.parentElement.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        button.style.color = '#667eea';
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        button.style.color = '#718096';
    }
    
    // Add animation
    button.style.transform = 'translateY(-50%) scale(1.2)';
    setTimeout(() => {
        button.style.transform = 'translateY(-50%) scale(1)';
    }, 150);
}

function handleLoginSubmit(event) {
    const form = event.target;
    const submitBtn = form.querySelector('.btn-primary');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const btnIcon = submitBtn.querySelector('.btn-icon');
    
    // Show loading state
    btnText.style.opacity = '0';
    btnLoader.style.display = 'block';
    btnIcon.style.display = 'none';
    submitBtn.disabled = true;
    
    // Simulate loading (remove this in production)
    setTimeout(() => {
        // Reset button state if needed
        btnText.style.opacity = '1';
        btnLoader.style.display = 'none';
        btnIcon.style.display = 'inline';
        submitBtn.disabled = false;
    }, 2000);
}

function addRippleEffect(element, event = null) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event ? event.clientX - rect.left - size / 2 : size / 2;
    const y = event ? event.clientY - rect.top - size / 2 : size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function addParallaxEffect() {
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

// Add CSS for animations and effects
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
    
    .form-group.has-value label {
        color: #667eea;
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
    
    .fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .auth-card:hover {
        transform: translateY(-5px);
        box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
    
    .feature:hover {
        transform: translateY(-5px);
    }
    
    .feature i {
        transition: all 0.3s ease;
    }
    
    .feature:hover i {
        transform: scale(1.1);
        color: rgba(255, 255, 255, 1);
    }
`;
document.head.appendChild(style);
