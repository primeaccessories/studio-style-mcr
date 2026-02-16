// Search functionality
function toggleSearch() {
  var overlay = document.getElementById('searchOverlay');
  if (overlay.classList.contains('active')) {
    closeSearch();
  } else {
    overlay.classList.add('active');
    document.getElementById('searchInput').focus();
    document.body.style.overflow = 'hidden';
  }
}

function closeSearch() {
  var overlay = document.getElementById('searchOverlay');
  overlay.classList.remove('active');
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
  document.body.style.overflow = '';
}

function performSearch() {
  var query = document.getElementById('searchInput').value.trim().toLowerCase();
  var resultsContainer = document.getElementById('searchResults');

  if (query.length < 2) {
    resultsContainer.innerHTML = '<p class="search-hint">Type at least 2 characters to search...</p>';
    return;
  }

  var products = getProducts();
  var matches = products.filter(function(p) {
    // Hide products that are yet to go live
    var cols = p.collections || (p.collection ? [p.collection] : []);
    if (cols.indexOf('yet-to-go-live') > -1) return false;
    return p.name.toLowerCase().indexOf(query) !== -1;
  });

  if (matches.length === 0) {
    resultsContainer.innerHTML = '<p class="search-no-results">No products found for "' + query.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') + '"</p>';
    return;
  }

  // Map collection to page
  var collectionPages = {
    'new-arrivals': 'new-arrivals.html',
    'last-chance': 'last-chance.html',
    'accessories': 'accessories.html'
  };

  var html = matches.map(function(p) {
    var cols = p.collections || (p.collection ? [p.collection] : []);
    var firstCol = cols.length > 0 ? cols[0] : 'new-arrivals';
    if (firstCol === 'yet-to-go-live') firstCol = 'new-arrivals';
    var page = collectionPages[firstCol] || 'new-arrivals.html';
    var priceText = p.sale && p.originalPrice
      ? '<span class="search-was">&pound;' + p.originalPrice.toFixed(2) + '</span> &pound;' + p.price.toFixed(2)
      : '&pound;' + p.price.toFixed(2);

    return '<a href="product.html?id=' + p.id + '" class="search-result-item" onclick="closeSearch()">' +
      '<img src="' + p.image + '" alt="">' +
      '<div class="search-result-info">' +
        '<span class="search-result-name">' + p.name + '</span>' +
        '<span class="search-result-price">' + priceText + '</span>' +
      '</div>' +
    '</a>';
  }).join('');

  resultsContainer.innerHTML = html;
}

// Close on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeSearch();
});
