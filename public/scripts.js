document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  initLoginPage();
  initMainPage();
  updatePing();
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
    particle.style.animationDelay = Math.random() * 25 + 's';
    particle.style.animationDuration = (Math.random() * 15 + 20) + 's';
    particles.appendChild(particle);
  }
}

function initLoginPage() {
  if (!document.querySelector('.login-page')) return;

  const onlineCount = document.getElementById('onlineCount');
  const pingDisplay = document.getElementById('pingDisplay');
  const totalCount = document.getElementById('totalCount');

  if (onlineCount) animateStats(onlineCount, 247);
  if (totalCount) animateStats(totalCount, 1543);
  if (pingDisplay) updatePingDisplay(pingDisplay);
}

function animateStats(element, target) {
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 30);
}

function updatePingDisplay(element) {
  function setPing() {
    const ping = Math.floor(Math.random() * (40 - 15 + 1)) + 15;
    element.textContent = ping + 'ms';
  }
  setPing();
  setInterval(setPing, 3000);
}

function initMainPage() {
  if (!document.querySelector('.main-page')) return;

  const onlineUsers = document.getElementById('onlineUsers');
  const activeConnections = document.getElementById('activeConnections');
  const logoutBtn = document.getElementById('logoutBtn');

  if (onlineUsers) animateStats(onlineUsers, 247);
  if (activeConnections) animateStats(activeConnections, 1543);

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('azreal_authenticated');
      window.location.href = 'login.html';
    });
  }
}

function updatePing() {
  const pingElement = document.getElementById('currentPing');
  if (!pingElement) return;

  function setPing() {
    const ping = Math.floor(Math.random() * (40 - 15 + 1)) + 15;
    pingElement.textContent = ping + 'ms';
  }

  setPing();
  setInterval(setPing, 3000);
}
