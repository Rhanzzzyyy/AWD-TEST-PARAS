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

    // Form submission handler (prevent default for demo)
    const registrationForm = document.querySelector('.registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your form submission logic here
            const userType = isOrganizer ? 'Organizer' : 'Player';
            
            // Simple validation example
            const username = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            console.log(`Form submitted with: Username: ${username}, Email: ${email}, Type: ${userType}`);
            alert(`Thanks for registering as a ${userType}!`);
        });
    }

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