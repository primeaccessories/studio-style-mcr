// Default product data - used when no localStorage data exists
var DEFAULT_PRODUCTS = [
  // NEW ARRIVALS
  { id: 'acid-house', name: 'ACID HOUSE', price: 17.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'beehive-bottoms', name: 'BEE HIVE BOTTOMS', price: 19.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'brooke', name: 'BROOKE', price: 17.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'brushed-g', name: 'BRUSHED G', price: 7.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'cappa-tee', name: 'CAPPA TEE', price: 13.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'chocolate-dream-na', name: 'CHOCOLATE DREAM', price: 12.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'cluster-bee', name: 'CLUSTER BEE', price: 7.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'cocoons-na', name: 'COCOONS', price: 24.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'cream-n-choc', name: 'CREAM N CHOC', price: 12.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'dinky-d', name: 'DINKY D', price: 7.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'encrusted-d', name: 'ENCRUSTED D', price: 7.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'farah-na', name: 'FARAH', price: 19.00, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'graffiti-d', name: 'GRAFFITI D', price: 7.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'lace-of-spades-na', name: 'LACE OF SPADES', price: 21.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'lady-muck-navy', name: 'LADY MUCK (Navy)', price: 12.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'lady-muck-black', name: 'LADY MUCK (Black)', price: 12.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'love-frills-na', name: 'LOVE FRILLS', price: 21.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'mad-chester-grey', name: 'MAD CHESTER (Grey)', price: 12.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'mad-chester-blue', name: 'MAD CHESTER (Blue)', price: 12.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'mama-d', name: 'MAMA D', price: 7.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'pearl-bee', name: 'PEARL BEE', price: 7.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'safari-baseline-na', name: 'SAFARI BASELINE', price: 17.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'shiny-g', name: 'SHINY G', price: 7.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'iceberg-shirt-na', name: 'THE ICEBERG SHIRT', price: 24.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'jet-jogger-na', name: 'THE JET JOGGER', price: 19.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'leopard-lux-chocolate', name: 'LEOPARD LUX (Chocolate)', price: 17.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'tigeress-lux-chocolate', name: 'TIGERESS LUX (Chocolate)', price: 17.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'tigeress-lux-black', name: 'TIGERESS LUX (Black)', price: 17.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'winter-warmers-black', name: 'WINTER WARMERS (Black)', price: 5.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'winter-warmers-navy', name: 'WINTER WARMERS (Navy)', price: 5.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'winter-warmers-gunmetal', name: 'WINTER WARMERS (Gunmetal)', price: 5.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'oriental-express-ink', name: 'ORIENTAL EXPRESS (Ink)', price: 9.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'oriental-express-beige', name: 'ORIENTAL EXPRESS (Beige)', price: 9.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'oriental-express-grey', name: 'ORIENTAL EXPRESS (Grey)', price: 9.99, image: '/images/placeholder-product.svg', collections: ['new-arrivals'], sale: false, originalPrice: null },

  // LAST CHANCE TO BUY
  { id: 'cocoons', name: 'COCOONS', price: 24.99, image: '/images/placeholder-product.svg', collections: ['last-chance'], sale: false, originalPrice: null },
  { id: 'lace-of-spades', name: 'LACE OF SPADES', price: 21.99, image: '/images/placeholder-product.svg', collections: ['last-chance'], sale: false, originalPrice: null },
  { id: 'farah', name: 'FARAH', price: 19.00, image: '/images/placeholder-product.svg', collections: ['last-chance'], sale: false, originalPrice: null },
  { id: 'love-frills', name: 'LOVE FRILLS', price: 21.99, image: '/images/placeholder-product.svg', collections: ['last-chance'], sale: false, originalPrice: null },

  // ACCESSORIES
  { id: 'chocolate-dream', name: 'CHOCOLATE DREAM', price: 12.99, image: '/images/placeholder-product.svg', collections: ['accessories'], sale: false, originalPrice: null },
  { id: 'safari-baseline', name: 'SAFARI BASELINE', price: 17.99, image: '/images/placeholder-product.svg', collections: ['accessories'], sale: false, originalPrice: null },
  { id: 'iceberg-shirt', name: 'THE ICEBERG SHIRT', price: 24.99, image: '/images/placeholder-product.svg', collections: ['accessories'], sale: false, originalPrice: null },
  { id: 'jet-jogger', name: 'THE JET JOGGER', price: 19.99, image: '/images/placeholder-product.svg', collections: ['accessories'], sale: false, originalPrice: null },
  { id: 'exotic-island', name: 'EXOTIC ISLAND', price: 9.00, image: '/images/placeholder-product.svg', collections: ['accessories'], sale: true, originalPrice: 18.00 },
  { id: 'marbella-navy', name: 'MARBELLA (Navy)', price: 12.50, image: '/images/placeholder-product.svg', collections: ['accessories'], sale: true, originalPrice: 25.00 },
  { id: 'marbella-cappuchino', name: 'MARBELLA (Cappuchino)', price: 12.50, image: '/images/placeholder-product.svg', collections: ['accessories'], sale: true, originalPrice: 25.00 },
  { id: 'marbella-black', name: 'MARBELLA (Black)', price: 12.50, image: '/images/placeholder-product.svg', collections: ['accessories'], sale: true, originalPrice: 25.00 }
];

// Migrate old collection names and single collection to arrays
function migrateCollections(products) {
  var migrated = false;
  products.forEach(function(p) {
    if (p.collection === 'best-sellers') {
      p.collection = 'last-chance';
      migrated = true;
    } else if (p.collection === 'sale') {
      p.collection = 'accessories';
      migrated = true;
    }
    // Migrate single collection string to collections array
    if (p.collection && !p.collections) {
      p.collections = [p.collection];
      delete p.collection;
      migrated = true;
    }
  });
  return migrated;
}

// Clear stale localStorage cache — bump version to force refresh from Firebase
var _productsCacheVersion = 2;
if (parseInt(localStorage.getItem('studioProductsVersion')) !== _productsCacheVersion) {
  localStorage.removeItem('studioProducts');
  localStorage.setItem('studioProductsVersion', _productsCacheVersion);
}

// Products cache - updated by real-time listener
var _productsCache = null;
var _productsListenerInit = false;

// Initialize real-time products listener (call after Firebase is ready)
function initProductsListener() {
  if (_productsListenerInit) return;
  if (typeof db === 'undefined') return;
  _productsListenerInit = true;

  db.collection('siteData').doc('products')
    .onSnapshot(function(doc) {
      if (doc.exists && doc.data().items) {
        _productsCache = doc.data().items;
        // Also update localStorage as fast cache
        localStorage.setItem('studioProducts', JSON.stringify(_productsCache));
        // Re-render if a render function is waiting
        if (typeof _pendingRender === 'function') {
          _pendingRender();
          _pendingRender = null;
        }
      }
    }, function(error) {
      console.error('Error listening to products:', error);
    });
}

var _pendingRender = null;

// Get products - returns cached/local/default
function getProducts() {
  if (_productsCache) return _productsCache;

  var stored = localStorage.getItem('studioProducts');
  if (stored) {
    var products = JSON.parse(stored);
    if (migrateCollections(products)) {
      localStorage.setItem('studioProducts', JSON.stringify(products));
    }
    return products;
  }
  return DEFAULT_PRODUCTS;
}

// Save products to Firebase and localStorage
function saveProducts(products) {
  localStorage.setItem('studioProducts', JSON.stringify(products));
  _productsCache = products;

  // Save to Firebase if available
  if (typeof db !== 'undefined') {
    db.collection('siteData').doc('products').set({ items: products })
      .catch(function(error) {
        console.error('Error saving products to Firebase:', error);
      });
  }
}

// Migrate localStorage products to Firebase (one-time)
function migrateProductsToFirebase() {
  if (typeof db === 'undefined') return;

  db.collection('siteData').doc('products').get().then(function(doc) {
    if (!doc.exists) {
      // No products in Firebase yet - upload current products
      var products = getProducts();
      db.collection('siteData').doc('products').set({ items: products })
        .then(function() { console.log('Products migrated to Firebase'); })
        .catch(function(error) { console.error('Migration error:', error); });
    }
  });
}

// Render products on a collection page
function renderCollectionProducts(collection) {
  var grid = document.querySelector('.products-grid');
  if (!grid) return;

  // Set up re-render when Firebase data arrives
  _pendingRender = function() { renderCollectionProducts(collection); };

  var products = getProducts().filter(function(p) {
    var cols = p.collections || (p.collection ? [p.collection] : []);
    // Hide products that are yet to go live
    if (cols.indexOf('yet-to-go-live') > -1) return false;
    return cols.indexOf(collection) > -1;
  });

  // Sort by sortOrder (lowest first = shows first)
  products.sort(function(a, b) {
    var orderA = typeof a.sortOrder === 'number' ? a.sortOrder : 9999;
    var orderB = typeof b.sortOrder === 'number' ? b.sortOrder : 9999;
    return orderA - orderB;
  });

  grid.innerHTML = '';

  products.forEach(function(p) {
    var priceHTML;
    if (p.sale && p.originalPrice) {
      priceHTML = '<span class="was-price">&pound;' + p.originalPrice.toFixed(2) + '</span> &pound;' + p.price.toFixed(2);
    } else {
      priceHTML = '&pound;' + p.price.toFixed(2);
    }

    var card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML =
      '<a href="product.html?id=' + p.id + '" class="product-image-link">' +
        '<div class="product-image">' +
          (p.sale ? '<span class="sale-badge">SALE</span>' : '') +
          '<img src="' + p.image + '" alt="' + p.name + '" onerror="this.onerror=null;this.src=\'/images/placeholder-product.svg\'">' +
        '</div>' +
      '</a>' +
      '<div class="product-info">' +
        '<a href="product.html?id=' + p.id + '" class="product-name-link"><h3>' + p.name + '</h3></a>' +
        '<p class="price">' + priceHTML + '</p>' +
        '<button class="add-to-cart-btn" onclick="addToCart(\'' + p.id + '\', \'' + p.name.replace(/'/g, "\\'") + '\', ' + p.price + ', \'' + p.image + '\', event)">Add to Cart</button>' +
      '</div>';
    grid.appendChild(card);
  });
}
