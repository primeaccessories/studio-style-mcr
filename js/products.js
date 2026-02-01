// Default product data - used when no localStorage data exists
var DEFAULT_PRODUCTS = [
  // NEW ARRIVALS
  { id: 'acid-house', name: 'ACID HOUSE', price: 17.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/16B82986-7190-4260-A5ED-02D1E1182308.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'beehive-bottoms', name: 'BEE HIVE BOTTOMS', price: 19.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/F911DD9E-C609-4242-8B34-BE1032ABEBB2.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'brooke', name: 'BROOKE', price: 17.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/FDAE30EC-1A11-439E-8BD7-82254CE5CD57.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'brushed-g', name: 'BRUSHED G', price: 7.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/A9074E7F-5F07-4184-810F-8D5E41F0D496.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'cappa-tee', name: 'CAPPA TEE', price: 13.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/BD43343C-A5D3-4FEA-8A5E-8219C84D84E4.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'chocolate-dream-na', name: 'CHOCOLATE DREAM', price: 12.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/F5DC3DFD-FBBF-4B86-BEED-73F1CE3C5F72.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'cluster-bee', name: 'CLUSTER BEE', price: 7.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/43D0AA93-C724-42C4-8648-F2DD8024DF7B.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'cocoons-na', name: 'COCOONS', price: 24.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/370AC8C2-3919-4FCC-B803-38F6646556C6.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'cream-n-choc', name: 'CREAM N CHOC', price: 12.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/22BDC0B3-94C0-4D4F-80FF-46DAA00696B8.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'dinky-d', name: 'DINKY D', price: 7.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/776FE26E-19BA-4430-A59F-4D67433E78B3.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'encrusted-d', name: 'ENCRUSTED D', price: 7.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/DB4DCF8F-7134-4D51-9621-1C6EA43E669F.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'farah-na', name: 'FARAH', price: 19.00, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/813C02A4-659B-4956-B48E-CA633005FF1C.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'graffiti-d', name: 'GRAFFITI D', price: 7.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/DBDB2620-3B18-4000-A244-064D22D38F11.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'lace-of-spades-na', name: 'LACE OF SPADES', price: 21.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/21EF7A53-218D-4142-9477-B4F7064FF233.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'lady-muck-navy', name: 'LADY MUCK (Navy)', price: 12.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/6B1FF789-E1DF-437D-BDE0-2FECA416BE17.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'lady-muck-black', name: 'LADY MUCK (Black)', price: 12.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/2EAD721D-8013-40CD-BBEE-F1C6EA61BB28.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'love-frills-na', name: 'LOVE FRILLS', price: 21.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/91F35980-EB95-4615-B894-92798D5A1894.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'mad-chester-grey', name: 'MAD CHESTER (Grey)', price: 12.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/C9C6026A-4DCE-4E66-A8F6-FB0EA6225737.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'mad-chester-blue', name: 'MAD CHESTER (Blue)', price: 12.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/1D12BE6B-0D3D-4D4B-9C74-83E8E11FCE16.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'mama-d', name: 'MAMA D', price: 7.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/C3E44145-824A-4BE7-8DF8-EEF099F51D64.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'pearl-bee', name: 'PEARL BEE', price: 7.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/A3FCAF41-27AB-4DCA-9ED4-22EEF3DC4F64.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'safari-baseline-na', name: 'SAFARI BASELINE', price: 17.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/3A4AFB55-3F26-48BE-AD4D-A69743D07EB1.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'shiny-g', name: 'SHINY G', price: 7.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/147D58DB-D949-42DE-9CAC-DF95CD891281.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'iceberg-shirt-na', name: 'THE ICEBERG SHIRT', price: 24.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/7667ED0E-4DF1-41F2-B493-AEFC15949D33.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'jet-jogger-na', name: 'THE JET JOGGER', price: 19.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/680AC55E-1B05-4852-8DA1-86EE2F39A4F4.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'leopard-lux-chocolate', name: 'LEOPARD LUX (Chocolate)', price: 17.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/86DE604E-DF28-4F0C-B6B9-F5CA6FC804FF.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'tigeress-lux-chocolate', name: 'TIGERESS LUX (Chocolate)', price: 17.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/991FB178-2640-4DC7-BC5B-CDDE25A29C5F.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'tigeress-lux-black', name: 'TIGERESS LUX (Black)', price: 17.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/26F726AA-1F95-4600-AE76-574CF85358F9.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'winter-warmers-black', name: 'WINTER WARMERS (Black)', price: 5.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/B09AE3C8-0501-4EF0-9CCD-D9AB7449B59A.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'winter-warmers-navy', name: 'WINTER WARMERS (Navy)', price: 5.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/FD9F24D5-3342-4DBB-ACDD-FC38CA8A4159.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'winter-warmers-gunmetal', name: 'WINTER WARMERS (Gunmetal)', price: 5.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/3E29C714-B8B7-409F-ABD1-1ACF0F30FC40.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'oriental-express-ink', name: 'ORIENTAL EXPRESS (Ink)', price: 9.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/C508F452-BA2E-4E65-B47E-E5BB8A76722E.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'oriental-express-beige', name: 'ORIENTAL EXPRESS (Beige)', price: 9.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/5AA85BF5-BE38-448D-B09D-BED68DC8A003.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },
  { id: 'oriental-express-grey', name: 'ORIENTAL EXPRESS (Grey)', price: 9.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/26A6E068-0355-41F2-B345-AA3BEDF4E3F3.jpg', collections: ['new-arrivals'], sale: false, originalPrice: null },

  // LAST CHANCE TO BUY
  { id: 'cocoons', name: 'COCOONS', price: 24.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/370AC8C2-3919-4FCC-B803-38F6646556C6.jpg', collections: ['last-chance'], sale: false, originalPrice: null },
  { id: 'lace-of-spades', name: 'LACE OF SPADES', price: 21.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/21EF7A53-218D-4142-9477-B4F7064FF233.jpg', collections: ['last-chance'], sale: false, originalPrice: null },
  { id: 'farah', name: 'FARAH', price: 19.00, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/813C02A4-659B-4956-B48E-CA633005FF1C.jpg', collections: ['last-chance'], sale: false, originalPrice: null },
  { id: 'love-frills', name: 'LOVE FRILLS', price: 21.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/91F35980-EB95-4615-B894-92798D5A1894.jpg', collections: ['last-chance'], sale: false, originalPrice: null },

  // ACCESSORIES
  { id: 'chocolate-dream', name: 'CHOCOLATE DREAM', price: 12.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/F5DC3DFD-FBBF-4B86-BEED-73F1CE3C5F72.jpg', collections: ['accessories'], sale: false, originalPrice: null },
  { id: 'safari-baseline', name: 'SAFARI BASELINE', price: 17.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/3A4AFB55-3F26-48BE-AD4D-A69743D07EB1.jpg', collections: ['accessories'], sale: false, originalPrice: null },
  { id: 'iceberg-shirt', name: 'THE ICEBERG SHIRT', price: 24.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/7667ED0E-4DF1-41F2-B493-AEFC15949D33.jpg', collections: ['accessories'], sale: false, originalPrice: null },
  { id: 'jet-jogger', name: 'THE JET JOGGER', price: 19.99, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/680AC55E-1B05-4852-8DA1-86EE2F39A4F4.jpg', collections: ['accessories'], sale: false, originalPrice: null },
  { id: 'exotic-island', name: 'EXOTIC ISLAND', price: 9.00, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/6559DF3F-E1C9-4F76-AFF7-C3EA7EEE1589.jpg', collections: ['accessories'], sale: true, originalPrice: 18.00 },
  { id: 'marbella-navy', name: 'MARBELLA (Navy)', price: 12.50, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/3182019B-C161-46AC-BE00-5A6E51EAC1D3.jpg', collections: ['accessories'], sale: true, originalPrice: 25.00 },
  { id: 'marbella-cappuchino', name: 'MARBELLA (Cappuchino)', price: 12.50, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/E562C7CD-1C38-4880-828D-A16713C57AC2.jpg', collections: ['accessories'], sale: true, originalPrice: 25.00 },
  { id: 'marbella-black', name: 'MARBELLA (Black)', price: 12.50, image: 'https://leboutiquefashion.co.uk/cdn/shop/files/75B06B14-EB84-4019-9C45-182BF0A70340.jpg', collections: ['accessories'], sale: true, originalPrice: 25.00 }
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
          '<img src="' + p.image + '" alt="' + p.name + '">' +
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
