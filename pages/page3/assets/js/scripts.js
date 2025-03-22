// JavaScript for the login page
document.addEventListener('DOMContentLoaded', function() {
    // Toggle remember me checkbox
    const rememberCheckbox = document.getElementById('remember-checkbox');
    if (rememberCheckbox) {
        rememberCheckbox.addEventListener('change', function() {
            this.parentElement.classList.toggle('active');
        });
    }

    // Form submission (prevent default for demo)
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would normally handle the login process
            const username = this.querySelector('input[type="text"]').value;
            console.log(`Login attempt for: ${username}`);
            
            // You could redirect after successful login
            // window.location.href = "../../index.html";
        });
    }
});