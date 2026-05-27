// BoostHive — Shared Data Layer

// ── Auth ──
function requireAuth() {
  const u = localStorage.getItem('bh_user');
  if (!u) { window.location.href = '/login.html'; return null; }
  return JSON.parse(u);
}

function requireAdmin() {
  const u = requireAuth();
  if (!u || u.role !== 'admin') { window.location.href = '/login.html'; return null; }
  return u;
}

function logout() {
  localStorage.removeItem('bh_user');
  window.location.href = '/login.html';
}

function getUser() {
  return JSON.parse(localStorage.getItem('bh_user') || 'null');
}

function updateUserBalance(userId, delta) {
  // Update in users list
  const users = JSON.parse(localStorage.getItem('bh_users') || '[]');
  const idx = users.findIndex(u => u.id === userId);
  if (idx > -1) {
    users[idx].balance = Math.max(0, (users[idx].balance || 0) + delta);
    if (delta > 0) users[idx].totalFunded = (users[idx].totalFunded || 0) + delta;
    localStorage.setItem('bh_users', JSON.stringify(users));
  }
  // Update logged-in session
  const current = getUser();
  if (current && current.id === userId) {
    current.balance = Math.max(0, (current.balance || 0) + delta);
    localStorage.setItem('bh_user', JSON.stringify(current));
  }
}

// ── Orders ──
function getOrders() {
  return JSON.parse(localStorage.getItem('bh_orders') || '[]');
}

function saveOrder(order) {
  const orders = getOrders();
  const existing = orders.findIndex(o => o.id === order.id);
  if (existing > -1) orders[existing] = order;
  else orders.push(order);
  localStorage.setItem('bh_orders', JSON.stringify(orders));

  // Update user totals
  const users = JSON.parse(localStorage.getItem('bh_users') || '[]');
  const idx = users.findIndex(u => u.id === order.userId);
  if (idx > -1 && existing === -1) {
    users[idx].totalOrders = (users[idx].totalOrders || 0) + 1;
    users[idx].totalSpent = (users[idx].totalSpent || 0) + (order.charge || 0);
    localStorage.setItem('bh_users', JSON.stringify(users));
  }
}

function updateOrderStatus(orderId, status, startCount, remains) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx > -1) {
    orders[idx].status = status;
    if (startCount !== undefined) orders[idx].startCount = startCount;
    if (remains !== undefined) orders[idx].remains = remains;
    orders[idx].updatedAt = new Date().toISOString();
    localStorage.setItem('bh_orders', JSON.stringify(orders));
  }
}

// ── Transactions ──
function getTransactions() {
  return JSON.parse(localStorage.getItem('bh_transactions') || '[]');
}

function addTransaction(tx) {
  const txs = getTransactions();
  txs.unshift({ ...tx, id: Date.now(), createdAt: new Date().toISOString() });
  localStorage.setItem('bh_transactions', JSON.stringify(txs));
}

// ── Services ──
function getServices() {
  const stored = localStorage.getItem('bh_services');
  if (stored) return JSON.parse(stored);
  // Default services
  const defaults = [
    // Instagram
    { id: 1, platform: 'Instagram', category: 'Followers', name: 'Instagram Followers — High Quality', rate: 1.20, min: 100, max: 100000, description: 'Real-looking profiles, gradual delivery', active: true },
    { id: 2, platform: 'Instagram', category: 'Followers', name: 'Instagram Followers — Premium', rate: 2.50, min: 50, max: 50000, description: 'High retention, slow drip', active: true },
    { id: 3, platform: 'Instagram', category: 'Likes', name: 'Instagram Likes', rate: 0.35, min: 50, max: 50000, description: 'Fast delivery', active: true },
    { id: 4, platform: 'Instagram', category: 'Views', name: 'Instagram Video Views', rate: 0.08, min: 500, max: 1000000, description: 'Instant start', active: true },
    { id: 5, platform: 'Instagram', category: 'Views', name: 'Instagram Reel Views', rate: 0.10, min: 500, max: 1000000, description: 'Boost reel reach', active: true },
    { id: 6, platform: 'Instagram', category: 'Comments', name: 'Instagram Random Comments', rate: 3.50, min: 10, max: 500, description: 'Positive random comments', active: true },
    // YouTube
    { id: 10, platform: 'YouTube', category: 'Views', name: 'YouTube Views — Standard', rate: 0.60, min: 500, max: 500000, description: 'Real looking views', active: true },
    { id: 11, platform: 'YouTube', category: 'Views', name: 'YouTube Views — High Retention', rate: 1.80, min: 500, max: 100000, description: '70%+ retention', active: true },
    { id: 12, platform: 'YouTube', category: 'Subscribers', name: 'YouTube Subscribers', rate: 2.20, min: 100, max: 50000, description: 'Non-drop guarantee', active: true },
    { id: 13, platform: 'YouTube', category: 'Likes', name: 'YouTube Likes', rate: 0.80, min: 50, max: 10000, description: 'Fast start', active: true },
    { id: 14, platform: 'YouTube', category: 'Watch Time', name: 'YouTube Watch Time Hours', rate: 4.00, min: 100, max: 4000, description: 'Monetization ready', active: true },
    // TikTok
    { id: 20, platform: 'TikTok', category: 'Followers', name: 'TikTok Followers', rate: 0.90, min: 100, max: 100000, description: 'Fast delivery', active: true },
    { id: 21, platform: 'TikTok', category: 'Likes', name: 'TikTok Likes', rate: 0.12, min: 100, max: 500000, description: 'Instant start', active: true },
    { id: 22, platform: 'TikTok', category: 'Views', name: 'TikTok Video Views', rate: 0.05, min: 1000, max: 10000000, description: 'Cheapest rate', active: true },
    { id: 23, platform: 'TikTok', category: 'Shares', name: 'TikTok Shares', rate: 0.40, min: 100, max: 50000, description: 'Boost virality', active: true },
    // Twitter
    { id: 30, platform: 'Twitter', category: 'Followers', name: 'Twitter Followers', rate: 1.50, min: 100, max: 50000, description: 'Quality accounts', active: true },
    { id: 31, platform: 'Twitter', category: 'Likes', name: 'Twitter Likes', rate: 0.30, min: 50, max: 50000, description: 'Fast delivery', active: true },
    { id: 32, platform: 'Twitter', category: 'Retweets', name: 'Twitter Retweets', rate: 0.60, min: 50, max: 10000, description: 'Real-looking retweets', active: true },
    { id: 33, platform: 'Twitter', category: 'Views', name: 'Twitter Post Views', rate: 0.08, min: 500, max: 500000, description: 'Impression boost', active: true },
    // Facebook
    { id: 40, platform: 'Facebook', category: 'Page Likes', name: 'Facebook Page Likes', rate: 1.00, min: 100, max: 100000, description: 'Targeted countries', active: true },
    { id: 41, platform: 'Facebook', category: 'Post Likes', name: 'Facebook Post Likes', rate: 0.25, min: 50, max: 50000, description: 'Fast start', active: true },
    { id: 42, platform: 'Facebook', category: 'Followers', name: 'Facebook Profile Followers', rate: 0.80, min: 100, max: 50000, description: 'Profile boost', active: true },
    { id: 43, platform: 'Facebook', category: 'Views', name: 'Facebook Video Views', rate: 0.06, min: 1000, max: 1000000, description: 'Monetization push', active: true },
    // Telegram
    { id: 50, platform: 'Telegram', category: 'Members', name: 'Telegram Channel Members', rate: 0.80, min: 100, max: 100000, description: 'Real accounts', active: true },
    { id: 51, platform: 'Telegram', category: 'Views', name: 'Telegram Post Views', rate: 0.04, min: 500, max: 5000000, description: 'Cheapest price', active: true },
    { id: 52, platform: 'Telegram', category: 'Members', name: 'Telegram Group Members', rate: 0.90, min: 100, max: 50000, description: 'Active-looking', active: true },
    { id: 53, platform: 'Telegram', category: 'Reactions', name: 'Telegram Reactions ❤️', rate: 0.20, min: 100, max: 100000, description: 'Mixed reactions', active: true },
  ];
  localStorage.setItem('bh_services', JSON.stringify(defaults));
  return defaults;
}

function saveService(svc) {
  const svcs = getServices();
  const idx = svcs.findIndex(s => s.id === svc.id);
  if (idx > -1) svcs[idx] = svc;
  else svcs.push(svc);
  localStorage.setItem('bh_services', JSON.stringify(svcs));
}

function deleteService(id) {
  const svcs = getServices().filter(s => s.id !== id);
  localStorage.setItem('bh_services', JSON.stringify(svcs));
}

// ── Users ──
function getAllUsers() {
  return JSON.parse(localStorage.getItem('bh_users') || '[]');
}

// ── Sidebar render ──
function renderSidebar(user) {
  const avatar = document.getElementById('sb-avatar');
  const name = document.getElementById('sb-name');
  const bal = document.getElementById('sb-bal');
  const topBal = document.getElementById('top-bal');
  if (avatar) avatar.textContent = (user.name || 'U')[0].toUpperCase();
  if (name) name.textContent = user.name;
  if (bal) bal.textContent = '$' + (user.balance || 0).toFixed(2);
  if (topBal) topBal.textContent = '$' + (user.balance || 0).toFixed(2);
}

// ── Payment gateway stub ──
function initPayment(method, amount, userId, callback) {
  // In production, replace with real gateway API calls
  // Methods: nowpayments, paypal, stripe, manual
  return {
    method,
    amount,
    address: method === 'crypto' ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf' + Math.random().toString(36).slice(2,6) : null,
    paypalLink: method === 'paypal' ? `https://paypal.me/boosthive/${amount}` : null,
    status: 'pending'
  };
}
