// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

revealElements.forEach((el) => revealObserver.observe(el));

// ===== Navbar scroll shadow & mobile toggle =====
const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 10);
});

navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

// Close mobile menu on link click
navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
  });
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll("section[id]");

function updateActiveNav() {
  const scrollY = window.pageYOffset + navbar.offsetHeight + 20;
  sections.forEach((section) => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute("id");
    const link = navMenu.querySelector(`a[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  });
}

window.addEventListener("scroll", updateActiveNav);

// ===== Cart State =====
const cart = {};

const products = {
  "rice-1kg": { name: "Organic Rice — 1 kg", price: 250 },
  "rice-5kg": { name: "Organic Rice — 5 kg", price: 1150 },
  "rice-10kg": { name: "Organic Rice — 10 kg", price: 2100 },
};

// ===== Quantity controls on shop cards =====
document.querySelectorAll(".shop-card").forEach((card) => {
  const display = card.querySelector(".qty-display");
  const decreaseBtn = card.querySelector('[data-action="decrease"]');
  const increaseBtn = card.querySelector('[data-action="increase"]');
  const addBtn = card.querySelector(".btn-add-cart");
  let qty = 0;

  decreaseBtn.addEventListener("click", () => {
    if (qty > 0) {
      qty--;
      display.textContent = qty;
    }
  });

  increaseBtn.addEventListener("click", () => {
    qty++;
    display.textContent = qty;
  });

  addBtn.addEventListener("click", () => {
    if (qty === 0) return;
    const productId = card.dataset.product;
    if (cart[productId]) {
      cart[productId] += qty;
    } else {
      cart[productId] = qty;
    }
    qty = 0;
    display.textContent = 0;
    updateCartUI();
    openCart();
  });
});

// ===== Cart Drawer =====
const cartBtn = document.getElementById("cartBtn");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const cartItems = document.getElementById("cartItems");
const cartFooter = document.getElementById("cartFooter");
const cartCount = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");

function openCart() {
  cartOverlay.classList.add("open");
  cartDrawer.classList.add("open");
}

function closeCart() {
  cartOverlay.classList.remove("open");
  cartDrawer.classList.remove("open");
}

cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

function formatPrice(n) {
  return "₹" + n.toLocaleString("en-IN");
}

function updateCartUI() {
  const keys = Object.keys(cart).filter((k) => cart[k] > 0);
  const totalItems = keys.reduce((sum, k) => sum + cart[k], 0);
  cartCount.textContent = totalItems;

  if (keys.length === 0) {
    cartItems.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    cartFooter.style.display = "none";
    return;
  }

  let total = 0;
  let html = "";
  keys.forEach((id) => {
    const p = products[id];
    const subtotal = p.price * cart[id];
    total += subtotal;
    html += `
      <div class="cart-item" data-id="${id}">
        <div class="cart-item-info">
          <h4>${p.name}</h4>
          <p>${formatPrice(p.price)} × ${cart[id]} = ${formatPrice(subtotal)}</p>
        </div>
        <div class="cart-item-actions">
          <button class="qty-btn cart-dec" aria-label="Decrease">−</button>
          <span>${cart[id]}</span>
          <button class="qty-btn cart-inc" aria-label="Increase">+</button>
          <button class="cart-item-remove" aria-label="Remove">&times;</button>
        </div>
      </div>`;
  });

  cartItems.innerHTML = html;
  cartTotalEl.textContent = formatPrice(total);
  cartFooter.style.display = "block";

  // Bind cart item buttons
  cartItems.querySelectorAll(".cart-item").forEach((el) => {
    const id = el.dataset.id;
    el.querySelector(".cart-dec").addEventListener("click", () => {
      cart[id]--;
      if (cart[id] <= 0) delete cart[id];
      updateCartUI();
    });
    el.querySelector(".cart-inc").addEventListener("click", () => {
      cart[id]++;
      updateCartUI();
    });
    el.querySelector(".cart-item-remove").addEventListener("click", () => {
      delete cart[id];
      updateCartUI();
    });
  });
}

// ===== Checkout =====
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutOverlay = document.getElementById("checkoutOverlay");
const checkoutClose = document.getElementById("checkoutClose");
const checkoutSummary = document.getElementById("checkoutSummary");
const checkoutForm = document.getElementById("checkoutForm");
const orderConfirmation = document.getElementById("orderConfirmation");
const orderDone = document.getElementById("orderDone");

function openCheckout() {
  closeCart();
  // Build summary
  const keys = Object.keys(cart).filter((k) => cart[k] > 0);
  let total = 0;
  let html = "";
  keys.forEach((id) => {
    const p = products[id];
    const subtotal = p.price * cart[id];
    total += subtotal;
    html += `<div class="checkout-line"><span>${p.name} × ${cart[id]}</span><span>${formatPrice(subtotal)}</span></div>`;
  });
  html += `<div class="checkout-total"><span>Total</span><span>${formatPrice(total)}</span></div>`;
  checkoutSummary.innerHTML = html;

  checkoutForm.style.display = "block";
  orderConfirmation.style.display = "none";
  checkoutOverlay.classList.add("open");
}

function closeCheckout() {
  checkoutOverlay.classList.remove("open");
}

checkoutBtn.addEventListener("click", openCheckout);
checkoutClose.addEventListener("click", closeCheckout);
checkoutOverlay.addEventListener("click", (e) => {
  if (e.target === checkoutOverlay) closeCheckout();
});

checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // Clear cart
  Object.keys(cart).forEach((k) => delete cart[k]);
  updateCartUI();

  checkoutForm.style.display = "none";
  orderConfirmation.style.display = "block";
});

orderDone.addEventListener("click", () => {
  closeCheckout();
  checkoutForm.reset();
});

// ===== Smooth scroll offset for fixed nav =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
});
