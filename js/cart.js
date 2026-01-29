// Shopping Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count in header
function updateCartCount() {
  const cartCounts = document.querySelectorAll('.cart-count');
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCounts.forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

// Add item to cart
function addToCart(id, name, price, image) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, image, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();

  // Open mini cart when item is added
  const miniCart = document.getElementById('miniCart');
  const overlay = document.querySelector('.mini-cart-overlay');
  if (miniCart) {
    miniCart.classList.add('show');
    if (overlay) overlay.classList.add('show');
    renderMiniCart();
  }
}

// Remove item from cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

// Update quantity
function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
  }
}

// Get cart total
function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Show notification
function showNotification(message) {
  const existing = document.querySelector('.cart-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Mini Cart Functions
function toggleMiniCart() {
  const miniCart = document.getElementById('miniCart');
  const overlay = document.querySelector('.mini-cart-overlay');
  const floatingCartLink = document.querySelector('.cart-link:not(.cart-link-header)');
  const whatsappBtn = document.querySelector('.whatsapp-float');

  if (miniCart) {
    // Position cart based on page type
    if (whatsappBtn) {
      // Has WhatsApp button - use top right
      miniCart.classList.remove('bottom-right');
    } else {
      // No WhatsApp - use bottom right (shop pages)
      miniCart.classList.add('bottom-right');
    }

    const isOpening = !miniCart.classList.contains('show');
    miniCart.classList.toggle('show');
    if (overlay) overlay.classList.toggle('show');

    // Hide floating cart button when cart opens (if exists)
    if (floatingCartLink) {
      if (isOpening) {
        floatingCartLink.classList.add('hidden');
      } else {
        floatingCartLink.classList.remove('hidden');
      }
    }
    renderMiniCart();
  }
}

function closeMiniCart() {
  const miniCart = document.getElementById('miniCart');
  const overlay = document.querySelector('.mini-cart-overlay');
  const cartLink = document.querySelector('.cart-link:not(.cart-link-header)');
  if (miniCart) miniCart.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
  if (cartLink) cartLink.classList.remove('hidden');
}

function renderMiniCart() {
  const miniCartItems = document.getElementById('miniCartItems');
  const miniCartFooter = document.getElementById('miniCartFooter');
  const miniCartTotal = document.getElementById('miniCartTotal');

  if (!miniCartItems) return;

  if (cart.length === 0) {
    miniCartItems.innerHTML = '<div class="mini-cart-empty">Your basket is empty</div>';
    if (miniCartFooter) miniCartFooter.style.display = 'none';
    return;
  }

  miniCartItems.innerHTML = cart.map(item => `
    <div class="mini-cart-item">
      <div class="mini-cart-item-image">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
      </div>
      <div class="mini-cart-item-details">
        <h4>${item.name}</h4>
        <p>Qty: ${item.quantity}</p>
      </div>
      <div class="mini-cart-item-price">£${(item.price * item.quantity).toFixed(2)}</div>
    </div>
  `).join('');

  if (miniCartFooter) miniCartFooter.style.display = 'block';
  if (miniCartTotal) miniCartTotal.textContent = `£${getCartTotal().toFixed(2)}`;
}

// Render cart page
function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const cartEmpty = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');

  if (!cartItems) return;

  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.style.display = 'block';
    if (cartContent) cartContent.style.display = 'none';
    return;
  }

  if (cartEmpty) cartEmpty.style.display = 'none';
  if (cartContent) cartContent.style.display = 'block';

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<span>No image</span>'}
      </div>
      <div class="cart-item-details">
        <h3>${item.name}</h3>
        <p class="cart-item-price">£${item.price.toFixed(2)}</p>
      </div>
      <div class="cart-item-quantity">
        <button onclick="updateQuantity('${item.id}', -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity('${item.id}', 1)">+</button>
      </div>
      <div class="cart-item-total">
        £${(item.price * item.quantity).toFixed(2)}
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">&times;</button>
    </div>
  `).join('');

  if (cartTotal) {
    cartTotal.textContent = `£${getCartTotal().toFixed(2)}`;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCart();

  // Hide announcement bar on mobile scroll
  let lastScroll = 0;
  const ticker = document.querySelector('.announcement-ticker');

  if (ticker && window.innerWidth <= 768) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        ticker.classList.add('hidden');
      } else {
        ticker.classList.remove('hidden');
      }

      lastScroll = currentScroll;
    });
  }
});
