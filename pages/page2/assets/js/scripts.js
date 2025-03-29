document.addEventListener('DOMContentLoaded', function() {
    // User type toggle functionality
    const userToggle = document.getElementById('user-toggle');
    const playerOption = document.querySelector('.player-option');
    const organizerOption = document.querySelector('.organizer-option');
    let isOrganizer = false;

    if (userToggle) {
        userToggle.addEventListener('click', function() {
            isOrganizer = !isOrganizer;
            if (isOrganizer) {
                userToggle.classList.add('toggle-active');
                organizerOption.classList.add('active');
                playerOption.classList.remove('active');
            } else {
                userToggle.classList.remove('toggle-active');
                playerOption.classList.add('active');
                organizerOption.classList.remove('active');
            }
        });
    }

    // Highlight player option by default
    playerOption.classList.add('active');

    // Optional: Add click handlers for the type options
    playerOption.addEventListener('click', function() {
        if (isOrganizer) {
            isOrganizer = false;
            userToggle.classList.remove('toggle-active');
            playerOption.classList.add('active');
            organizerOption.classList.remove('active');
        }
    });

    organizerOption.addEventListener('click', function() {
        if (!isOrganizer) {
            isOrganizer = true;
            userToggle.classList.add('toggle-active');
            organizerOption.classList.add('active');
            playerOption.classList.remove('active');
        }
    });

    // Form submission handler with notification
    const registrationForm = document.querySelector('.registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const username = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match!', 'error');
                return;
            }
            
            const userType = isOrganizer ? 'Organizer' : 'Player';
            
            // Store user info in localStorage (for demo purposes)
            localStorage.setItem('paraUser', JSON.stringify({
                username: username,
                email: email,
                type: userType,
                isLoggedIn: true
            }));
            
            // Show success notification
            showNotification(`Successfully registered as ${userType}!`, 'success');
            
            // Update navbar to show logged-in state
            updateNavbarLoginStatus();
            
            // Redirect to home page after short delay
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 2000);
        });
    }
    
    // Check if user is logged in on page load
    updateNavbarLoginStatus();
    
    // Optional: Add some arcade-style animation effects
    function createPixel() {
        const pixel = document.createElement('div');
        pixel.classList.add('arcade-pixel');
        pixel.style.left = Math.random() * 100 + 'vw';
        pixel.style.animationDuration = Math.random() * 3 + 2 + 's';
        document.getElementById('arcade-bg').appendChild(pixel);
        
        // Remove pixel after animation completes
        setTimeout(() => {
            pixel.remove();
        }, 5000);
    }
    
    // Create pixels periodically if the arcade-bg element exists
    const arcadeBg = document.getElementById('arcade-bg');
    if (arcadeBg) {
        setInterval(createPixel, 300);
    }
});

// Function to show notification
function showNotification(message, type) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fa-solid fa-times"></i></button>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Add animation class after a small delay
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

// Function to update navbar based on login status
function updateNavbarLoginStatus() {
    const userData = JSON.parse(localStorage.getItem('paraUser'));
    const signupLink = document.querySelector('.navbar-nav.ms-auto .nav-link:last-child');
    
    if (userData && userData.isLoggedIn) {
        // Only modify the signup link to show the username
        if (signupLink) {
            signupLink.innerHTML = `<i class="fa-solid fa-user-check"></i><span class="username-display">${userData.username}</span>`;
            signupLink.href = '#'; // User profile page (can be changed later)
            signupLink.classList.add('logged-in');
            
            // Add logout option on hover
            const logoutMenu = document.createElement('div');
            logoutMenu.className = 'logout-menu';
            logoutMenu.innerHTML = '<a href="#" id="logout-btn"><i class="fa-solid fa-sign-out-alt"></i>Logout</a>';
            signupLink.appendChild(logoutMenu);
            
            document.getElementById('logout-btn').addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                localStorage.removeItem('paraUser');
                showNotification('You have been logged out', 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            });
        }
    }
}