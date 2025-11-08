document.addEventListener('DOMContentLoaded', function() {
  const year = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = year;

  createParticles();
  initModal();
  initNavToggle();
  initLoginPage();
  initMainPage();
});

function createParticles() {
  const particles = document.getElementById('particles');
  if (!particles) return;

  const particleCount = 50;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
    particles.appendChild(particle);
  }
}

function initModal() {
  const modal = document.getElementById('channelModal');
  const modalClose = document.getElementById('modalClose');
  const confirmFollow = document.getElementById('confirmFollow');

  if (!modal) return;

  setTimeout(() => {
    modal.classList.add('show');
  }, 1000);

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  if (confirmFollow) {
    confirmFollow.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
}

function initNavToggle() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

function initLoginPage() {
  if (!document.querySelector('.login-page')) return;

  const googleLogin = document.getElementById('googleLogin');
  const guestLogin = document.getElementById('guestLogin');
  const onlineCount = document.getElementById('onlineCount');
  const pingDisplay = document.getElementById('pingDisplay');

  animateStats(onlineCount, 247);
  updatePing(pingDisplay);

  if (googleLogin) {
    googleLogin.addEventListener('click', () => {
      console.log('Google login initiated');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    });
  }

  if (guestLogin) {
    guestLogin.addEventListener('click', () => {
      console.log('Guest login initiated');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    });
  }
}

function animateStats(element, target) {
  if (!element) return;
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
      setInterval(() => {
        const variation = Math.floor(Math.random() * 10) - 5;
        element.textContent = Math.max(1, target + variation);
      }, 3000);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 30);
}

function updatePing(element) {
  if (!element) return;
  setInterval(() => {
    const ping = Math.floor(Math.random() * 30) + 15;
    element.textContent = ping + 'ms';
  }, 2000);
}

function initMainPage() {
  const requestPairing = document.getElementById('requestPairing');
  const phoneInput = document.getElementById('phone');
  const statusDiv = document.getElementById('status');
  const activeSockets = document.getElementById('activeSockets');
  const totalUsers = document.getElementById('totalUsers');

  if (activeSockets) animateStats(activeSockets, 12);
  if (totalUsers) animateStats(totalUsers, 1543);

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
      if (activeSockets) activeSockets.textContent = data.active || 0;
      if (totalUsers) totalUsers.textContent = data.total || 0;
    });

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }
}
