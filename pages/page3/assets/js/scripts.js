document.addEventListener('DOMContentLoaded', function() {
    // Handle form submission
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const username = this.querySelector('input[type="text"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const remember = document.getElementById('remember').checked;
            
            // In a real app, you would send this to a server
            console.log('Login attempt:', { username, password, remember });
            
            // For demo, show success message
            alert('Login successful! Welcome back to PARAS.');
            
            // Redirect to home page after successful login
            // window.location.href = '../../index.html';
        });
    }
});