// Stock notification system — "Notify Me" for out-of-stock products
// Stores email signups in Firestore: stockNotifications/{docId}

// Show notify modal for a product (or auto-submit if logged in)
function showNotifyModal(productId, productName) {
  // If logged in, skip modal and save directly
  if (typeof auth !== 'undefined' && auth.currentUser && auth.currentUser.email) {
    saveNotifyDirect(productId, productName, auth.currentUser.email, auth.currentUser.uid);
    return;
  }

  // Not logged in — show modal to collect email
  var existing = document.getElementById('notifyModal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'notifyModal';
  modal.className = 'notify-modal-overlay';
  modal.innerHTML =
    '<div class="notify-modal">' +
      '<button class="notify-modal-close" onclick="closeNotifyModal()">&times;</button>' +
      '<div class="notify-modal-icon"><i class="fas fa-bell"></i></div>' +
      '<h3>Get notified when it\'s back</h3>' +
      '<p class="notify-modal-product">' + productName + '</p>' +
      '<p class="notify-modal-desc">Enter your email and we\'ll let you know as soon as this item is back in stock.</p>' +
      '<form onsubmit="submitNotify(event, \'' + productId.replace(/'/g, "\\'") + '\', \'' + productName.replace(/'/g, "\\'") + '\')">' +
        '<input type="email" id="notifyEmail" class="notify-email-input" placeholder="your@email.com" required>' +
        '<button type="submit" class="notify-submit-btn" id="notifySubmitBtn">Notify Me</button>' +
      '</form>' +
    '</div>';

  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('show'); }, 10);
  document.getElementById('notifyEmail').focus();
}

function closeNotifyModal() {
  var modal = document.getElementById('notifyModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(function() { modal.remove(); }, 300);
  }
}

// Direct save for logged-in users (no modal)
function saveNotifyDirect(productId, productName, email, userId) {
  if (typeof db === 'undefined') return;

  // Show quick toast immediately
  showNotifyToast('<i class="fas fa-spinner fa-spin"></i> Signing you up...');

  db.collection('stockNotifications')
    .where('productId', '==', productId)
    .where('email', '==', email)
    .get()
    .then(function(snapshot) {
      var alreadyActive = false;
      snapshot.forEach(function(doc) {
        if (!doc.data().notified) alreadyActive = true;
      });

      if (alreadyActive) {
        showNotifyToast('<i class="fas fa-check"></i> You\'re already on the list!');
        return;
      }

      return db.collection('stockNotifications').add({
        productId: productId,
        productName: productName,
        email: email,
        userId: userId,
        notified: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        showNotifyToast('<i class="fas fa-bell"></i> We\'ll email you when it\'s back!');
      });
    })
    .catch(function(error) {
      console.error('Notify signup error:', error);
      showNotifyToast('<i class="fas fa-times"></i> Something went wrong, try again');
    });
}

// Submit notification signup from modal (guest users)
function submitNotify(e, productId, productName) {
  e.preventDefault();

  var email = document.getElementById('notifyEmail').value.trim();
  if (!email) return;

  var btn = document.getElementById('notifySubmitBtn');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  if (typeof db === 'undefined') {
    btn.textContent = 'Error — try again';
    btn.disabled = false;
    return;
  }

  db.collection('stockNotifications')
    .where('productId', '==', productId)
    .where('email', '==', email)
    .get()
    .then(function(snapshot) {
      var alreadyActive = false;
      snapshot.forEach(function(doc) {
        if (!doc.data().notified) alreadyActive = true;
      });
      if (alreadyActive) {
        btn.textContent = 'Already signed up!';
        setTimeout(function() { closeNotifyModal(); }, 1200);
        return Promise.resolve();
      }

      return db.collection('stockNotifications').add({
        productId: productId,
        productName: productName,
        email: email,
        userId: null,
        notified: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        btn.innerHTML = '<i class="fas fa-check"></i> We\'ll email you!';
        btn.style.background = '#2f855a';
        btn.style.color = '#fff';
        setTimeout(function() { closeNotifyModal(); }, 1500);
      });
    })
    .catch(function(error) {
      console.error('Notify signup error:', error);
      btn.textContent = 'Error — try again';
      btn.disabled = false;
    });
}

// Toast notification for notify actions
function showNotifyToast(message) {
  var existing = document.querySelector('.notify-toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'notify-toast';
  toast.innerHTML = message;
  toast.style.cssText = 'position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px); background: #2c2c2c; color: #fff; padding: 14px 24px; font-size: 0.85rem; border-radius: 6px; z-index: 10000; opacity: 0; transition: all 0.3s ease; font-family: inherit; white-space: nowrap;';
  document.body.appendChild(toast);

  setTimeout(function() { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(function() { toast.remove(); }, 300);
  }, 2500);
}
