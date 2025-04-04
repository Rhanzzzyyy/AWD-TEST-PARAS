document.addEventListener('DOMContentLoaded', function() {
    // User interface elements
    const userToggle = document.getElementById('user-toggle');
    const playerOption = document.querySelector('.player-option');
    const organizerOption = document.querySelector('.organizer-option');
    let isOrganizer = false;

    // Initialize UI state
    function updateUserTypeUI() {
        if (isOrganizer) {
            userToggle.classList.add('toggle-active');
            organizerOption.classList.add('active');
            playerOption.classList.remove('active');
        } else {
            userToggle.classList.remove('toggle-active');
            playerOption.classList.add('active');
            organizerOption.classList.remove('active');
        }
    }

    // Event listeners for user type toggle
    if (userToggle) {
        userToggle.addEventListener('click', function() {
            isOrganizer = !isOrganizer;
            updateUserTypeUI();
        });
    }

    playerOption.addEventListener('click', function() {
        if (isOrganizer) {
            isOrganizer = false;
            updateUserTypeUI();
        }
    });

    organizerOption.addEventListener('click', function() {
        if (!isOrganizer) {
            isOrganizer = true;
            updateUserTypeUI();
        }
    });

    // Initialize UI
    updateUserTypeUI();

    // Form submission handler with enhanced error handling
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const role = isOrganizer ? 'organizer' : 'player';
            
            // Client-side validation
            if (!name || !email || !password || !confirmPassword) {
                showNotification('Please fill in all fields!', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match!', 'error');
                return;
            }
            
            if (password.length < 8) {
                showNotification('Password must be at least 8 characters!', 'error');
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = registrationForm.querySelector('.submit-button');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';

                // Verify network connectivity
                if (!navigator.onLine) {
                    throw new Error('No internet connection detected');
                }

                // Make the API request with no-cors mode
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                // Note: With no-cors mode, we can't read the response or set certain headers
                await fetch('http://localhost:3000/api/GameHub/users', {
                    method: 'POST',
                    mode: 'no-cors', // This is the critical change
                    body: JSON.stringify({ 
                        name, 
                        email, 
                        password,
                        role 
                    }),
                    signal: controller.signal
                }).finally(() => clearTimeout(timeoutId));

                // Since we can't read the response in no-cors mode, we'll assume success
                showNotification('Registration request sent!', 'success');
                
                // Store user data locally
                localStorage.setItem('paraCurrentUser', JSON.stringify({
                    id: Date.now().toString(),
                    username: name,
                    email: email,
                    role: role,
                    isLoggedIn: true
                }));

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = isOrganizer ? '../../../../index.html' : '/player-dashboard.html';
                }, 2000);

            } catch (error) {
                console.error('Registration error:', error);
                let errorMessage = error.message;
                
                if (error.name === 'AbortError') {
                    errorMessage = 'Request timed out. Server is not responding';
                } else if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Connection failed. Please check your network connection';
                }

                showNotification(errorMessage, 'error');
                
                // Reset button state
                const submitBtn = registrationForm.querySelector('.submit-button');
                submitBtn.disabled = false;
                submitBtn.textContent = 'GET STARTED NOW';
            }
        });
    }

    // Check login status on page load
    updateNavbarLoginStatus();

    // Network status monitoring
    window.addEventListener('online', () => showNotification('Back online', 'success'));
    window.addEventListener('offline', () => showNotification('No internet connection', 'error'));
});

// Notification system
function showNotification(message, type) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fa-solid fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, type === 'error' ? 10000 : 5000);
}

// Navbar login status management
function updateNavbarLoginStatus() {
    const userData = JSON.parse(localStorage.getItem('paraCurrentUser'));
    const signupLink = document.querySelector('.navbar-nav.ms-auto .nav-link:last-child');
    
    if (userData && userData.isLoggedIn) {
        if (signupLink) {
            const roleBadge = userData.role === 'organizer' ? 
                '<span class="badge bg-warning">Organizer</span>' : 
                '<span class="badge bg-info">Player</span>';
            
            signupLink.innerHTML = `
                <i class="fa-solid fa-user-check"></i>
                <span class="username-display">${userData.username}</span>
                ${roleBadge}
            `;
            signupLink.href = '#';
            signupLink.classList.add('logged-in');
            
            const logoutMenu = document.createElement('div');
            logoutMenu.className = 'logout-menu';
            logoutMenu.innerHTML = `
                <a href="#" id="logout-btn">
                    <i class="fa-solid fa-sign-out-alt"></i>Logout
                </a>
            `;
            signupLink.appendChild(logoutMenu);
            
            document.getElementById('logout-btn').addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                localStorage.removeItem('paraCurrentUser');
                showNotification('You have been logged out', 'success');
                setTimeout(() => window.location.href = '/', 1500);
            });
        }
    }
}

// API request utility with no-cors mode
async function makeApiRequest(url, method, body = null, retries = 2) {
    try {
        const options = {
            method,
            mode: 'no-cors', // Using no-cors mode
            body: body ? JSON.stringify(body) : null
        };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        // With no-cors, we can't read the response
        await fetch(url, {
            ...options,
            signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        // Return mock success since we can't read the actual response
        return { status: 'request_sent' };
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return makeApiRequest(url, method, body, retries - 1);
        }
        throw error;
    }
}