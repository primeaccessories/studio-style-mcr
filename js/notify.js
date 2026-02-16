// Stock notification system — "Notify Me" for out-of-stock products
// Stores email signups in Firestore: stockNotifications/{docId}

// Show notify modal for a product
function showNotifyModal(productId, productName) {
  // Remove existing modal
  var existing = document.getElementById('notifyModal');
  if (existing) existing.remove();

  // Auto-fill email if logged in
  var userEmail = '';
  if (typeof auth !== 'undefined' && auth.currentUser && auth.currentUser.email) {
    userEmail = auth.currentUser.email;
  }

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
        '<input type="email" id="notifyEmail" class="notify-email-input" placeholder="your@email.com" value="' + userEmail + '" required>' +
        '<button type="submit" class="notify-submit-btn" id="notifySubmitBtn">Notify Me</button>' +
      '</form>' +
    '</div>';

  document.body.appendChild(modal);
  setTimeout(function() { modal.classList.add('show'); }, 10);

  // Focus email input if empty
  if (!userEmail) {
    document.getElementById('notifyEmail').focus();
  }
}

function closeNotifyModal() {
  var modal = document.getElementById('notifyModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(function() { modal.remove(); }, 300);
  }
}

// Submit notification signup
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

  // Check if this email is already subscribed for this product
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
        // Already subscribed
        btn.textContent = 'Already signed up!';
        setTimeout(function() { closeNotifyModal(); }, 1200);
        return Promise.resolve();
      }

      // Save new notification request
      return db.collection('stockNotifications').add({
        productId: productId,
        productName: productName,
        email: email,
        userId: (typeof auth !== 'undefined' && auth.currentUser) ? auth.currentUser.uid : null,
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
