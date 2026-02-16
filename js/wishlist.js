// Wishlist functionality — Firebase-backed, syncs across devices
var _wishlistCache = [];
var _wishlistUnsubscribe = null;
var _wishlistReady = false;

// Initialize wishlist listener when auth is ready
function initWishlistListener() {
  if (typeof auth === 'undefined') return;

  auth.onAuthStateChanged(function(user) {
    // Clean up previous listener
    if (_wishlistUnsubscribe) {
      _wishlistUnsubscribe();
      _wishlistUnsubscribe = null;
    }
    _wishlistCache = [];
    _wishlistReady = false;

    if (user) {
      _wishlistUnsubscribe = db.collection('users').doc(user.uid)
        .collection('wishlist')
        .orderBy('addedAt', 'desc')
        .onSnapshot(function(snapshot) {
          _wishlistCache = [];
          snapshot.forEach(function(doc) {
            _wishlistCache.push({ docId: doc.id, ...doc.data() });
          });
          _wishlistReady = true;
          updateWishlistCount();
          updateWishlistHearts();
          // Re-render wishlist page if visible
          if (typeof renderWishlistTab === 'function') renderWishlistTab();
        }, function(error) {
          console.error('Wishlist listener error:', error);
        });
    } else {
      updateWishlistCount();
      updateWishlistHearts();
    }
  });
}

// Add to wishlist
function addToWishlist(productId, name, price, image) {
  var user = auth.currentUser;
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Check if already in wishlist
  var existing = _wishlistCache.find(function(item) { return item.productId === productId; });
  if (existing) {
    removeFromWishlist(productId);
    return;
  }

  db.collection('users').doc(user.uid).collection('wishlist').add({
    productId: productId,
    name: name,
    price: price,
    image: image,
    addedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function() {
    showWishlistToast('Added to wishlist');
  }).catch(function(error) {
    console.error('Error adding to wishlist:', error);
  });
}

// Remove from wishlist
function removeFromWishlist(productId) {
  var user = auth.currentUser;
  if (!user) return;

  var item = _wishlistCache.find(function(i) { return i.productId === productId; });
  if (!item) return;

  db.collection('users').doc(user.uid).collection('wishlist').doc(item.docId).delete()
    .then(function() {
      showWishlistToast('Removed from wishlist');
    }).catch(function(error) {
      console.error('Error removing from wishlist:', error);
    });
}

// Check if product is in wishlist
function isInWishlist(productId) {
  return _wishlistCache.some(function(item) { return item.productId === productId; });
}

// Get wishlist items
function getWishlist() {
  return _wishlistCache;
}

// Update wishlist count badges in header
function updateWishlistCount() {
  var badges = document.querySelectorAll('.wishlist-count');
  var count = _wishlistCache.length;
  badges.forEach(function(el) {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Update all heart icons on page to reflect wishlist state
function updateWishlistHearts() {
  // Product card hearts
  var hearts = document.querySelectorAll('.wishlist-heart-btn');
  hearts.forEach(function(btn) {
    var pid = btn.getAttribute('data-product-id');
    if (isInWishlist(pid)) {
      btn.classList.add('wishlisted');
      btn.querySelector('i').className = 'fas fa-heart';
    } else {
      btn.classList.remove('wishlisted');
      btn.querySelector('i').className = 'far fa-heart';
    }
  });
  // Product detail page button
  if (typeof updateProductWishlistBtn === 'function') {
    updateProductWishlistBtn();
  }
}

// Toast notification
function showWishlistToast(message) {
  var existing = document.querySelector('.wishlist-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'wishlist-toast';
  toast.innerHTML = '<i class="fas fa-heart"></i> ' + message;
  document.body.appendChild(toast);

  setTimeout(function() { toast.classList.add('show'); }, 10);
  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 300);
  }, 2000);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initWishlistListener();
});
