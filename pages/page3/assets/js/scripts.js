document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    
    // Add logout event listener
    document.querySelector('.logout-link')?.addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
    });

    // Initialize form submission handler
    initLoginForm();
});

// Function to initialize login form
function initLoginForm() {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
}

// Login form submission handler
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    const remember = form.querySelector('#remember')?.checked;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Validation
    if (!validateLoginForm(email, password)) {
        return;
    }

    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner">⚙️</span> AUTHENTICATING...';

        // Make API request
        const user = await authenticateUser(email, password);
        
        // Login success
        handleLoginSuccess(user, remember);
        
    } catch (error) {
        handleLoginError(error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// Form validation
function validateLoginForm(email, password) {
    if (!email || !password) {
        showCyberNotification('ERROR', 'Please enter both email and password!', 'error');
        return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showCyberNotification('ERROR', 'Please enter a valid email address!', 'error');
        return false;
    }
    
    return true;
}

// Authentication function with API call
async function authenticateUser(email, password) {
    try {
        // First check if user exists
        const response = await fetch(`http://localhost:3000/api/GameHub/users/login/${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Invalid server response' }));
            throw new Error(error.message || 'Login failed');
        }

        const user = await response.json();

        // In a real app, the password should be hashed and verified on the server side
        // This is just a basic example - NEVER do password comparison in client-side in production
        if (user.password !== password) {
            throw new Error('Invalid email or password');
        }

        return user;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

// Handle successful login
function handleLoginSuccess(user, remember) {
    // Store user data (without password)
    const { password: _, ...safeUser } = user;
    localStorage.setItem('currentUser', JSON.stringify({
        ...safeUser,
        isLoggedIn: true,
        rememberMe: remember
    }));

    showCyberNotification('ACCESS GRANTED', `Welcome ${user.name || user.email}!`, 'success');
    updateAuthUI();
    
    // Redirect to landing page after successful login
    setTimeout(() => {
        window.location.href = '../../../../index.html';
    }, 2000);
}

// Handle login error
function handleLoginError(error) {
    console.error('Login error:', error);
    const errorMessage = error.message.includes('Failed to fetch') ? 'Network error. Please try again.' :
                        error.message.includes('credentials') ? 'Invalid email or password' :
                        error.message || 'Login failed';
    
    showCyberNotification('ACCESS DENIED', errorMessage, 'error');
}

// Function to update the authentication UI based on login state
function updateAuthUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authLinks = document.getElementById('authLinks');
    const userDropdown = document.getElementById('userDropdown');
    const usernameDisplay = document.getElementById('usernameDisplay');

    if (currentUser && currentUser.isLoggedIn) {
        // User is logged in
        authLinks.style.display = 'none';
        userDropdown.style.display = 'block';
        usernameDisplay.textContent = currentUser.name || currentUser.email.split('@')[0];
    } else {
        // User is not logged in
        authLinks.style.display = 'flex';
        userDropdown.style.display = 'none';
    }
}

// Function to handle user logout
function logoutUser() {
    // Show initial logout notification
    showCyberNotification('SYSTEM', 'Initiating secure logout sequence...', 'info');
    
    setTimeout(() => {
        localStorage.removeItem('currentUser');
        // Show confirmation notification
        showCyberNotification('LOGOUT COMPLETE', 'All sessions terminated. System secure.', 'success');
        updateAuthUI();
        
        // Redirect to home page after logout
        setTimeout(() => {
            window.location.href = '../../../../index.html';
        }, 1500);
    }, 1000);
}

// Function to display cyberpunk notifications
function showCyberNotification(title, message, type = 'success') {
    // Create notification container if it doesn't exist
    if (!document.querySelector('.cyber-notification-container')) {
        const container = document.createElement('div');
        container.className = 'cyber-notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `cyber-notification ${type === 'error' ? 'cyber-error' : type === 'info' ? 'cyber-info' : 'cyber-success'}`;
    
    // Create notification content
    notification.innerHTML = `
        <button class="cyber-close">&times;</button>
        <div class="cyber-header">
            <span class="cyber-glitch ${type === 'error' ? '' : type === 'info' ? 'cyber-glitch-purple' : 'cyber-glitch-blue'}" data-text="${title}">${title}</span>
        </div>
        <div class="cyber-content">${message}</div>
        <div class="cyber-scanlines"></div>
    `;
    
    // Add to container
    document.querySelector('.cyber-notification-container').appendChild(notification);
    
    // Add click event for close button
    notification.querySelector('.cyber-close').addEventListener('click', function() {
        notification.classList.add('cyber-hide');
        setTimeout(() => {
            notification.remove();
        }, 400);
    });
    
    // Show notification with effects
    setTimeout(() => {
        notification.classList.add('cyber-show');
        setTimeout(() => {
            notification.classList.add('cyber-flicker');
            setTimeout(() => {
                notification.classList.remove('cyber-flicker');
            }, 100);
        }, 300);
    }, 100);
    
    // Auto-hide after 6 seconds
    setTimeout(() => {
        notification.classList.add('cyber-hide');
        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 6000);
}

// Add spinner style dynamically
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
    .spinner {
        display: inline-block;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    /* Cyber Notification Styles */
    .cyber-notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
    }
    
    .cyber-notification {
        position: relative;
        width: 300px;
        padding: 15px;
        margin-bottom: 15px;
        border: 1px solid;
        font-family: 'Courier New', monospace;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.4s ease-out;
        background-color: rgba(0, 0, 0, 0.8);
        color: #0f0;
        overflow: hidden;
    }
    
    .cyber-notification.cyber-show {
        opacity: 1;
        transform: translateX(0);
    }
    
    .cyber-notification.cyber-hide {
        opacity: 0;
        transform: translateX(100%);
    }
    
    .cyber-notification.cyber-error {
        border-color: #f00;
        color: #f00;
    }
    
    .cyber-notification.cyber-success {
        border-color: #0f0;
        color: #0f0;
    }
    
    .cyber-notification.cyber-info {
        border-color: #90f;
        color: #90f;
    }
    
    .cyber-header {
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 1.1em;
    }
    
    .cyber-close {
        position: absolute;
        top: 5px;
        right: 5px;
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 1.2em;
    }
    
    .cyber-glitch {
        position: relative;
    }
    
    .cyber-glitch:before, .cyber-glitch:after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    
    .cyber-glitch:before {
        left: 2px;
        text-shadow: -2px 0 #ff00ff;
        clip: rect(44px, 450px, 56px, 0);
        animation: glitch-anim 5s infinite linear alternate-reverse;
    }
    
    .cyber-glitch:after {
        left: -2px;
        text-shadow: -2px 0 #00ffff;
        clip: rect(44px, 450px, 56px, 0);
        animation: glitch-anim2 5s infinite linear alternate-reverse;
    }
    
    .cyber-glitch-blue:before {
        text-shadow: -2px 0 #00ffff;
    }
    
    .cyber-glitch-blue:after {
        text-shadow: 2px 0 #ff00ff;
    }
    
    .cyber-glitch-purple:before {
        text-shadow: -2px 0 #ff00ff;
    }
    
    .cyber-glitch-purple:after {
        text-shadow: 2px 0 #00ffff;
    }
    
    .cyber-flicker {
        animation: flicker 0.1s linear;
    }
    
    .cyber-scanlines {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 255, 0, 0.05) 50%,
            transparent 100%
        );
        background-size: 100% 4px;
        pointer-events: none;
    }
    
    @keyframes glitch-anim {
        0% { clip: rect(31px, 9999px, 94px, 0); }
        10% { clip: rect(112px, 9999px, 76px, 0); }
        20% { clip: rect(85px, 9999px, 77px, 0); }
        30% { clip: rect(27px, 9999px, 97px, 0); }
        40% { clip: rect(64px, 9999px, 98px, 0); }
        50% { clip: rect(61px, 9999px, 85px, 0); }
        60% { clip: rect(99px, 9999px, 114px, 0); }
        70% { clip: rect(34px, 9999px, 115px, 0); }
        80% { clip: rect(98px, 9999px, 129px, 0); }
        90% { clip: rect(43px, 9999px, 96px, 0); }
        100% { clip: rect(82px, 9999px, 64px, 0); }
    }
    
    @keyframes glitch-anim2 {
        0% { clip: rect(65px, 9999px, 119px, 0); }
        10% { clip: rect(25px, 9999px, 145px, 0); }
        20% { clip: rect(129px, 9999px, 52px, 0); }
        30% { clip: rect(60px, 9999px, 87px, 0); }
        40% { clip: rect(78px, 9999px, 67px, 0); }
        50% { clip: rect(112px, 9999px, 82px, 0); }
        60% { clip: rect(21px, 9999px, 107px, 0); }
        70% { clip: rect(79px, 9999px, 130px, 0); }
        80% { clip: rect(105px, 9999px, 53px, 0); }
        90% { clip: rect(15px, 9999px, 75px, 0); }
        100% { clip: rect(37px, 9999px, 117px, 0); }
    }
    
    @keyframes flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
`;
document.head.appendChild(spinnerStyle);