document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.main-page')) {
    const isAuthenticated = localStorage.getItem('azreal_authenticated');
    if (!isAuthenticated) {
      window.location.href = 'login.html';
      return;
    }
  }

  const year = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = year;

  createParticles();
  initLoginPage();
  initMainPage();
  updatePing();
});

function createParticles() {
  const particles = document.getElementById('particles');
  if (!particles) return;

  const particleCount = 60;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 25 + 's';
    particle.style.animationDuration = (Math.random() * 15 + 20) + 's';
    particles.appendChild(particle);
  }
}

function initLoginPage() {
  if (!document.querySelector('.login-page')) return;

  const accessLogin = document.getElementById('accessLogin');
  const accessKeyInput = document.getElementById('accessKey');
  const keyStatus = document.getElementById('keyStatus');
  const onlineCount = document.getElementById('onlineCount');
  const pingDisplay = document.getElementById('pingDisplay');
  const totalCount = document.getElementById('totalCount');

  const validKeys = ['AZREAL-76336', 'AZREAL-76372'];

  if (onlineCount) animateStats(onlineCount, 247);
  if (totalCount) animateStats(totalCount, 1543);
  if (pingDisplay) updatePingDisplay(pingDisplay);

  if (accessKeyInput) {
    accessKeyInput.addEventListener('input', (e) => {
      let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      
      if (!value.startsWith('AZREAL-') && value.length > 0) {
        if (value.length <= 6) {
          value = 'AZREAL-' + value;
        }
      }
      
      if (value.startsWith('AZREAL-')) {
        const numberPart = value.substring(7);
        if (numberPart.length > 5) {
          value = 'AZREAL-' + numberPart.substring(0, 5);
        }
      }
      
      e.target.value = value;
      
      if (keyStatus) {
        keyStatus.style.display = 'none';
      }
    });
  }

  if (accessLogin && accessKeyInput) {
    accessLogin.addEventListener('click', () => {
      const key = accessKeyInput.value.trim().toUpperCase();

      if (!key) {
        showKeyStatus('Please enter an access key', 'invalid');
        return;
      }

      if (validKeys.includes(key)) {
        showKeyStatus('✓ Access Granted! Redirecting...', 'valid');
        accessLogin.disabled = true;
        accessLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
        
        localStorage.setItem('azreal_authenticated', 'true');
        localStorage.setItem('azreal_key', key);
        
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        showKeyStatus('✗ Invalid Access Key. Contact dev for assistance.', 'invalid');
        accessKeyInput.value = '';
      }
    });

    accessKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        accessLogin.click();
      }
    });
  }

  function showKeyStatus(message, type) {
    if (!keyStatus) return;
    keyStatus.className = 'key-status ' + type;
    keyStatus.textContent = message;
    keyStatus.style.display = 'block';
  }
}

function initMainPage() {
  const requestPairing = document.getElementById('requestPairing');
  const phoneInput = document.getElementById('phone');
  const statusDiv = document.getElementById('status');
  const onlineUsers = document.getElementById('onlineUsers');
  const activeConnections = document.getElementById('activeConnections');
  const totalUsers = document.getElementById('totalUsers');
  const pingValue = document.getElementById('pingValue');

  if (onlineUsers) animateStats(onlineUsers, 247);
  if (activeConnections) animateStats(activeConnections, 18);
  if (totalUsers) animateStats(totalUsers, 1543);
  if (pingValue) updatePingDisplay(pingValue);

  if (requestPairing && phoneInput && statusDiv) {
    requestPairing.addEventListener('click', async () => {
      const phone = phoneInput.value.trim();

      if (!phone) {
        showStatus('Please enter your phone number', 'error');
        return;
      }

      if (!/^\d{10,15}$/.test(phone)) {
        showStatus('Please enter a valid phone number with country code (digits only)', 'error');
        return;
      }

      requestPairing.disabled = true;
      requestPairing.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

      try {
        const response = await fetch('/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });

        const data = await response.json();

        if (data.success && data.code) {
          showStatus(`Your pairing code: <strong>${data.code}</strong><br>Enter this code in WhatsApp to link your device.`, 'success');
        } else {
          showStatus(data.error || 'Failed to generate pairing code. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showStatus('Connection error. Please check your internet and try again.', 'error');
      } finally {
        requestPairing.disabled = false;
        requestPairing.innerHTML = '<i class="fas fa-key"></i> Request Pairing Code';
      }
    });
  }

  function showStatus(message, type) {
    if (!statusDiv) return;
    statusDiv.className = type;
    statusDiv.innerHTML = message;
    statusDiv.style.display = 'block';

    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 10000);
  }

  if (typeof io !== 'undefined') {
    const socket = io();

    socket.on('stats', (data) => {
      if (activeConnections) activeConnections.textContent = data.active || 0;
      if (totalUsers) totalUsers.textContent = data.total || 0;
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      const target = item.getAttribute('href');
      if (target && target !== '#dashboard') {
        const section = document.querySelector(target);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

function animateStats(element, target) {
  if (!element) return;
  let current = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
      setInterval(() => {
        const variation = Math.floor(Math.random() * 10) - 5;
        element.textContent = Math.max(1, target + variation).toLocaleString();
      }, 4000);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 25);
}

function updatePing() {
  const pingValue = document.getElementById('pingValue');
  if (pingValue) {
    updatePingDisplay(pingValue);
  }
}

function updatePingDisplay(element) {
  if (!element) return;
  
  function setPing() {
    const ping = Math.floor(Math.random() * 25) + 15;
    element.textContent = ping + 'ms';
  }
  
  setPing();
  
  setInterval(setPing, 2000);
}
