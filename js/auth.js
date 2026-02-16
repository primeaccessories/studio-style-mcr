// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAb7lZfMV8Dk-O07uzbYFt07IASelOihVA",
  authDomain: "studiostylemcr-e5ead.firebaseapp.com",
  projectId: "studiostylemcr-e5ead",
  storageBucket: "studiostylemcr-e5ead.firebasestorage.app",
  messagingSenderId: "763513185614",
  appId: "1:763513185614:web:98a10b3b5d9fd0aa2caa1f",
  measurementId: "G-25R94YS2PC"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Initialize products real-time sync
if (typeof initProductsListener === 'function') {
  initProductsListener();
  migrateProductsToFirebase();
}

// Auth State Observer
auth.onAuthStateChanged(function(user) {
  updateNavAuth(user);

  if (user) {
    // User is signed in
    console.log('User signed in:', user.email);
  } else {
    // User is signed out
    console.log('User signed out');
  }
});

// Update navigation based on auth state
function updateNavAuth(user) {
  const accountLinks = document.querySelectorAll('.account-link');

  // Remove all existing dropdowns
  document.querySelectorAll('#account-dropdown').forEach(function(el) { el.remove(); });

  var dropdownCreated = false;
  accountLinks.forEach(link => {
    if (user) {
      link.style.display = 'block';
      link.innerHTML = '<i class="fas fa-user"></i>';
      link.href = '#';
      link.style.position = 'relative';

      // Fetch user data and show name
      db.collection('users').doc(user.uid).get().then(function(doc) {
        if (doc.exists) {
          var data = doc.data();
          var name = data.firstName || user.displayName?.split(' ')[0] || '';
          if (name) {
            link.innerHTML = '<i class="fas fa-user"></i> ' + name;
          }
        }
      }).catch(function() {});

      // Create dropdown on first account link only
      if (!dropdownCreated) {
        dropdownCreated = true;
        var dropdown = document.createElement('div');
        dropdown.id = 'account-dropdown';
        dropdown.className = 'account-dropdown';
        dropdown.style.display = 'none';
        dropdown.innerHTML =
          '<div class="dropdown-rewards" id="dropdown-rewards">Loading rewards...</div>' +
          '<a href="account.html" class="dropdown-link"><i class="fas fa-user-cog"></i> My Account</a>' +
          '<button class="dropdown-signout" onclick="signOut()"><i class="fas fa-sign-out-alt"></i> Sign Out</button>';
        link.parentElement.appendChild(dropdown);
      }

      // Load rewards into dropdown
      db.collection('users').doc(user.uid).get().then(function(doc) {
        var rewardsEl = document.getElementById('dropdown-rewards');
        if (!rewardsEl) return;
        if (doc.exists) {
          var data = doc.data();
          var orderCount = (data.rewards && data.rewards.orderCount) || 0;
          var rewardAvailable = (data.rewards && data.rewards.rewardAvailable) || false;

          if (rewardAvailable) {
            rewardsEl.innerHTML = '<div class="dropdown-reward-badge">£20 OFF</div><p>Applied at checkout!</p>';
          } else {
            var remaining = 5 - (orderCount % 5);
            rewardsEl.innerHTML =
              '<div class="dropdown-stamps">' + buildDots(orderCount % 5) + '</div>' +
              '<p>' + remaining + ' more order' + (remaining !== 1 ? 's' : '') + ' until £20 off</p>';
          }
        }
      }).catch(function() {});

      // Toggle dropdown on click
      link.onclick = function(e) {
        e.preventDefault();
        var dd = document.getElementById('account-dropdown');
        if (dd) {
          dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
        }
      };
    } else {
      link.style.display = 'block';
      link.innerHTML = '<i class="fas fa-user"></i>';
      link.href = 'login.html';
      link.onclick = null;
    }
  });
}

// Build stamp dots for dropdown
function buildDots(count) {
  var html = '';
  for (var i = 0; i < 5; i++) {
    html += '<span class="dropdown-dot ' + (i < count ? 'filled' : '') + '"></span>';
  }
  return html;
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  var dropdown = document.getElementById('account-dropdown');
  if (dropdown && !e.target.closest('.account-link') && !e.target.closest('.account-dropdown')) {
    dropdown.style.display = 'none';
  }
});

// Sign Up Function
async function signUp(email, password, firstName, lastName, phone) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      rewards: {
        orderCount: 0,
        rewardAvailable: false
      },
      purchases: []
    });

    // Update display name
    await user.updateProfile({
      displayName: firstName + ' ' + lastName
    });

    return { success: true, user: user };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Sign In Function
async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Google Sign In Function
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();

    if (!userDoc.exists) {
      // Create new user document for Google sign-in users
      const names = user.displayName ? user.displayName.split(' ') : ['', ''];
      await db.collection('users').doc(user.uid).set({
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: user.email,
        phone: user.phoneNumber || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        rewards: {
          orderCount: 0,
          rewardAvailable: false
        },
        purchases: [],
        signInMethod: 'google'
      });
    }

    return { success: true, user: user };
  } catch (error) {
    // If popup blocked, try redirect
    if (error.code === 'auth/popup-blocked') {
      auth.signInWithRedirect(provider);
      return { success: true, redirect: true };
    }
    console.error('Google sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Handle redirect result (for when popup is blocked)
auth.getRedirectResult().then(function(result) {
  if (result.user) {
    const user = result.user;
    // Check if user exists in Firestore
    db.collection('users').doc(user.uid).get().then(function(userDoc) {
      if (!userDoc.exists) {
        const names = user.displayName ? user.displayName.split(' ') : ['', ''];
        db.collection('users').doc(user.uid).set({
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
          email: user.email,
          phone: user.phoneNumber || '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          rewards: {
            orderCount: 0,
            rewardAvailable: false
          },
          purchases: [],
          signInMethod: 'google'
        });
      }
    });
    window.location.href = 'account.html';
  }
}).catch(function(error) {
  console.error('Redirect result error:', error);
});

// Sign Out Function
async function signOut() {
  try {
    await auth.signOut();
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// Get User Data
async function getUserData() {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const doc = await db.collection('users').doc(user.uid).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Get Purchase History
async function getPurchaseHistory() {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const snapshot = await db.collection('users').doc(user.uid)
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .get();

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    console.error('Error getting purchase history:', error);
    return [];
  }
}

// Add Purchase (call this after successful checkout)
async function addPurchase(orderData) {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    // Add order to user's orders subcollection
    await db.collection('users').doc(user.uid).collection('orders').add({
      ...orderData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Increment order count for rewards
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const newCount = ((userData.rewards && userData.rewards.orderCount) || 0) + 1;

    const rewardUpdate = { 'rewards.orderCount': newCount };

    // Grant reward every 5th order (5, 10, 15, etc.)
    if (newCount % 5 === 0) {
      rewardUpdate['rewards.rewardAvailable'] = true;
    }

    await db.collection('users').doc(user.uid).update(rewardUpdate);

    return true;
  } catch (error) {
    console.error('Error adding purchase:', error);
    return false;
  }
}



// Password Reset
async function resetPassword(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: error.message };
  }
}

// Update User Profile
async function updateUserProfile(data) {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    // Use set with merge to create doc if it doesn't exist
    await db.collection('users').doc(user.uid).set(data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

// Check if user is logged in
function isLoggedIn() {
  return auth.currentUser !== null;
}

// Require auth - redirect to login if not authenticated
function requireAuth() {
  auth.onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = 'login.html';
    }
  });
}

// ============================================
// REAL-TIME LISTENERS - Sync across all devices
// ============================================

// Store active listeners for cleanup
let userDataUnsubscribe = null;
let ordersUnsubscribe = null;

// Subscribe to user data changes in real-time
function subscribeToUserData(callback) {
  const user = auth.currentUser;
  if (!user) return null;

  // Unsubscribe from previous listener if exists
  if (userDataUnsubscribe) {
    userDataUnsubscribe();
  }

  // Set up real-time listener
  userDataUnsubscribe = db.collection('users').doc(user.uid)
    .onSnapshot(function(doc) {
      if (doc.exists) {
        callback(doc.data());
      }
    }, function(error) {
      console.error('Error listening to user data:', error);
    });

  return userDataUnsubscribe;
}

// Subscribe to orders in real-time
function subscribeToOrders(callback) {
  const user = auth.currentUser;
  if (!user) return null;

  // Unsubscribe from previous listener if exists
  if (ordersUnsubscribe) {
    ordersUnsubscribe();
  }

  // Set up real-time listener
  ordersUnsubscribe = db.collection('users').doc(user.uid)
    .collection('orders')
    .orderBy('createdAt', 'desc')
    .onSnapshot(function(snapshot) {
      const orders = [];
      snapshot.forEach(function(doc) {
        orders.push({ id: doc.id, ...doc.data() });
      });
      callback(orders);
    }, function(error) {
      console.error('Error listening to orders:', error);
    });

  return ordersUnsubscribe;
}

// Unsubscribe from all listeners (call on logout or page unload)
function unsubscribeAll() {
  if (userDataUnsubscribe) {
    userDataUnsubscribe();
    userDataUnsubscribe = null;
  }
  if (ordersUnsubscribe) {
    ordersUnsubscribe();
    ordersUnsubscribe = null;
  }
}

// Clean up listeners on sign out
auth.onAuthStateChanged(function(user) {
  if (!user) {
    unsubscribeAll();
  }
});
