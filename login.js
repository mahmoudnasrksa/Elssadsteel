// Login page functionality

// Check if already logged in
if (isLoggedIn()) {
  window.location.href = 'index.html';
}

// Load theme on page load
window.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  
  if (localStorage.getItem('rememberMe') === 'true') {
    const lastUser = localStorage.getItem('lastUsername');
    if (lastUser) {
      document.getElementById('username').value = lastUser;
      document.getElementById('rememberMe').checked = true;
    }
  }
  
  // Focus on username input
  document.getElementById('username').focus();
  
  // Handle Enter key on inputs
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin(e);
      }
    });
  });
});

// Theme Management
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    updateThemeIcon(true);
  } else {
    document.body.classList.remove('light-theme');
    updateThemeIcon(false);
  }
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  updateThemeIcon(isLight);
}

function updateThemeIcon(isLight) {
  const sunIcon = document.querySelector('.sun-icon');
  const moonIcon = document.querySelector('.moon-icon');
  
  if (sunIcon && moonIcon) {
    if (isLight) {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }
}

// Handle login form submission
function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  // Validate inputs
  if (!username || !password) {
    showAlert('الرجاء إدخال اسم المستخدم وكلمة المرور', 'error');
    return false;
  }
  
  // Attempt authentication
  const result = authenticate(username, password);
  
  if (result.success) {
    // Save remember me preference
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
    
    showAlert('تم تسجيل الدخول بنجاح!', 'success');
    
    // Redirect after short delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  } else {
    showAlert(result.message, 'error');
    
    // Shake animation
    const form = document.getElementById('loginForm');
    form.style.animation = 'none';
    setTimeout(() => {
      form.style.animation = 'shake 0.5s';
    }, 10);
  }
  
  return false;
}

// Show alert message
function showAlert(message, type = 'error') {
  const alertEl = document.getElementById('alert');
  alertEl.textContent = message;
  alertEl.className = `alert ${type}`;
  alertEl.style.display = 'block';
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    alertEl.style.display = 'none';
  }, 5000);
}

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eyeIcon');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    eyeIcon.textContent = '👁️';
  }
}

// Fill credentials for demo
function fillCredentials(username, password) {
  document.getElementById('username').value = username;
  document.getElementById('password').value = password;
  
  // Add visual feedback
  const demoCards = document.querySelectorAll('.demo-card');
  demoCards.forEach(card => {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = 'scale(1)';
    }, 100);
  });
}
