(function () {
  const header = document.getElementById('header');
  const nav = document.getElementById('nav');
  const menuToggle = document.getElementById('menuToggle');
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterNote = document.getElementById('newsletterNote');
  const cartCountEl = document.querySelector('.cart-btn__count');
  const cartBtn = document.getElementById('cartBtn');
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const toast = document.getElementById('toast');
  const productGrid = document.getElementById('productGrid');
  const productGridEmpty = document.getElementById('productGridEmpty');
  const logo = document.getElementById('logo');
  const footerLogo = document.getElementById('footerLogo');

  const productCards = [...document.querySelectorAll('.product-card')];
  const cart = [];
  let toastTimer = null;
  let activeCategory = null;

  header.classList.add('header--hero');

  function formatPrice(amount) {
    return `$${amount.toLocaleString('en-US')}`;
  }

  function getProductFromCard(card) {
    return {
      name: card.dataset.name,
      category: card.dataset.category,
      price: Number(card.dataset.price),
      image: card.querySelector('img')?.src || '',
    };
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add('toast--visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 2800);
  }

  function lockScroll(locked) {
    document.body.classList.toggle('no-scroll', locked);
  }

  function openOverlay(overlay, trigger) {
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    trigger?.setAttribute('aria-expanded', 'true');
    lockScroll(true);
  }

  function closeOverlay(overlay, trigger) {
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    trigger?.setAttribute('aria-expanded', 'false');
    if (searchOverlay.hidden && cartOverlay.hidden) {
      lockScroll(false);
    }
  }

  function updateCartUI() {
    const count = cart.length;
    cartCountEl.textContent = count;
    cartBtn.setAttribute('aria-label', `Cart, ${count} item${count !== 1 ? 's' : ''}`);

    cartItemsList.querySelectorAll('.cart-item').forEach((el) => el.remove());

    if (count === 0) {
      cartEmpty.hidden = false;
      cartFooter.hidden = true;
      return;
    }

    cartEmpty.hidden = true;
    cartFooter.hidden = false;

    let total = 0;
    cart.forEach((item, index) => {
      total += item.price;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img class="cart-item__image" src="${item.image}" alt="">
        <div class="cart-item__info">
          <strong>${item.name}</strong>
          <span>${item.category}</span>
          <span>${formatPrice(item.price)}</span>
        </div>
        <button class="cart-item__remove" aria-label="Remove ${item.name} from cart" data-index="${index}">&times;</button>
      `;
      cartItemsList.appendChild(row);
    });

    cartTotalEl.textContent = formatPrice(total);
  }

  function addToCart(card) {
    const product = getProductFromCard(card);
    cart.push(product);
    updateCartUI();
    showToast(`${product.name} added to cart`);
  }

  function onScroll() {
    header.classList.toggle('header--scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  [logo, footerLogo].forEach((el) => {
    el?.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.product-card__quick-add').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.product-card');
      addToCart(card);

      const original = btn.textContent;
      btn.textContent = 'Added!';
      btn.style.background = 'var(--color-text)';
      btn.style.color = '#fff';

      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.style.color = '';
      }, 1500);
    });
  });

  searchBtn.addEventListener('click', () => {
    openOverlay(searchOverlay, searchBtn);
    searchInput.value = '';
    renderSearchResults('');
    setTimeout(() => searchInput.focus(), 50);
  });

  searchClose.addEventListener('click', () => closeOverlay(searchOverlay, searchBtn));

  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeOverlay(searchOverlay, searchBtn);
  });

  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    const matches = productCards.filter((card) => {
      if (!q) return true;
      const name = card.dataset.name.toLowerCase();
      const category = card.dataset.category.toLowerCase();
      return name.includes(q) || category.includes(q);
    });

    searchResults.innerHTML = '';

    if (matches.length === 0) {
      searchResults.innerHTML = '<p class="search-results__empty">No products found.</p>';
      return;
    }

    matches.forEach((card) => {
      const product = getProductFromCard(card);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'search-result';
      btn.innerHTML = `
        <img src="${product.image}" alt="">
        <div>
          <strong>${product.name}</strong>
          <span>${product.category} · ${formatPrice(product.price)}</span>
        </div>
      `;
      btn.addEventListener('click', () => {
        closeOverlay(searchOverlay, searchBtn);
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('product-card--highlight');
        setTimeout(() => card.classList.remove('product-card--highlight'), 1200);
      });
      searchResults.appendChild(btn);
    });
  }

  searchInput.addEventListener('input', () => renderSearchResults(searchInput.value));

  cartBtn.addEventListener('click', () => {
    updateCartUI();
    openOverlay(cartOverlay, cartBtn);
  });

  cartClose.addEventListener('click', () => closeOverlay(cartOverlay, cartBtn));

  cartOverlay.addEventListener('click', (e) => {
    if (e.target === cartOverlay) closeOverlay(cartOverlay, cartBtn);
  });

  cartItemsList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.cart-item__remove');
    if (!removeBtn) return;
    const index = Number(removeBtn.dataset.index);
    const removed = cart.splice(index, 1)[0];
    updateCartUI();
    showToast(`${removed.name} removed from cart`);
  });

  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    closeOverlay(cartOverlay, cartBtn);
    showToast('Checkout coming soon — thanks for trying Meridian!');
  });

  document.querySelectorAll('[data-toast]').forEach((link) => {
    link.addEventListener('click', () => {
      showToast(link.dataset.toast);
    });
  });

  document.querySelectorAll('.category-card[data-category]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.dataset.category;
      filterProductsByCategory(category);
      document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
      showToast(`Showing ${category} products`);
    });
  });

  function filterProductsByCategory(category) {
    activeCategory = category;
    let visibleCount = 0;

    productCards.forEach((card) => {
      const match = card.dataset.category === category;
      card.hidden = !match;
      if (match) visibleCount += 1;
    });

    productGridEmpty.hidden = visibleCount > 0;
  }

  document.querySelector('a[href="#shop"].link-arrow')?.addEventListener('click', () => {
    if (activeCategory) {
      productCards.forEach((card) => { card.hidden = false; });
      productGridEmpty.hidden = true;
      activeCategory = null;
    }
  });

  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    newsletterForm.hidden = true;
    newsletterNote.hidden = false;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!searchOverlay.hidden) closeOverlay(searchOverlay, searchBtn);
      if (!cartOverlay.hidden) closeOverlay(cartOverlay, cartBtn);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.product-card, .category-card, .testimonial-card').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
})();
