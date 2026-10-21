(function () {
  "use strict";

  const products = window.READYKUT_PRODUCTS || [];
  const cartApi = window.ReadyKutCart;
  const cartStorageKey = "readykutveggies-cart-v1";
  const productGrid = document.getElementById("product-grid");
  const cartItems = document.getElementById("cart-items");
  let cart = loadCart();

  function loadCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
      return Array.isArray(stored) ? stored.filter((item) => item && typeof item.key === "string" && Number.isInteger(item.quantity) && item.quantity > 0) : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (error) {
      showCartMessage("Your browser could not save this bag. It will remain available until you close this page.");
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function renderProducts() {
    productGrid.innerHTML = products.map((product) => {
      const packOptions = product.packs.map((pack) => `<option value="${pack.grams}">${cartApi.formatWeight(pack.grams)} · ${cartApi.formatMoney(pack.price)}</option>`).join("");
      return `<article class="product-card" data-product-id="${escapeHtml(product.id)}">
        <div class="product-image-wrap"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}" loading="lazy"><span class="product-category">${escapeHtml(product.category)}</span></div>
        <div class="product-content"><div class="product-title-row"><h3>${escapeHtml(product.name)}</h3><span class="product-price" data-price>${cartApi.formatMoney(product.packs[0].price)}</span></div>
          <p class="product-description">${escapeHtml(product.description)}</p>
          <details class="product-details"><summary>Cooking & storage details</summary><p><strong>Try it:</strong> ${escapeHtml(product.uses)}</p><p><strong>Store it:</strong> ${escapeHtml(product.storage)}</p></details>
          <div class="product-controls"><label class="pack-label">Pack size<select class="pack-select" aria-label="Pack size for ${escapeHtml(product.name)}">${packOptions}</select></label><label class="quantity-label">Qty<input class="product-quantity" type="number" min="1" max="99" value="1" inputmode="numeric" aria-label="Quantity for ${escapeHtml(product.name)}"></label><button class="button button-add" type="button" data-add="${escapeHtml(product.id)}">Add to bag <span aria-hidden="true">+</span></button></div>
        </div></article>`;
    }).join("");
    productGrid.addEventListener("change", (event) => {
      const select = event.target.closest(".pack-select");
      if (!select) return;
      const card = select.closest(".product-card");
      const product = products.find((item) => item.id === card.dataset.productId);
      const pack = product.packs.find((item) => item.grams === Number(select.value));
      card.querySelector("[data-price]").textContent = cartApi.formatMoney(pack.price);
    });
    productGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-add]");
      if (!button) return;
      const card = button.closest(".product-card");
      const product = products.find((item) => item.id === button.dataset.add);
      const quantityInput = card.querySelector(".product-quantity");
      try {
        cartApi.addItem(cart, product, Number(card.querySelector(".pack-select").value), Number(quantityInput.value));
        saveCart();
        renderCart();
        button.innerHTML = "Added <span aria-hidden=\"true\">&#10003;</span>";
        window.setTimeout(() => { button.innerHTML = "Add to bag <span aria-hidden=\"true\">+</span>"; }, 1100);
      } catch (error) {
        quantityInput.setCustomValidity(error.message);
        quantityInput.reportValidity();
        quantityInput.addEventListener("input", () => quantityInput.setCustomValidity(""), { once: true });
      }
    });
  }

  function showCartMessage(message) {
    const existing = document.getElementById("cart-message");
    if (existing) existing.textContent = message;
  }

  function renderCart() {
    const count = cartApi.itemCount(cart);
    document.getElementById("header-cart-count").textContent = count;
    document.querySelector(".header-cart").setAttribute("aria-label", `Shopping cart, ${count} ${count === 1 ? "item" : "items"}`);
    document.getElementById("cart-heading-count").textContent = `(${count})`;
    if (cart.length === 0) {
      cartItems.innerHTML = `<div class="empty-cart"><span class="empty-cart-mark" aria-hidden="true">＋</span><div><h3>Your bag is ready for something fresh.</h3><p>Choose a product and pack size to get started.</p><a href="#shop" class="text-link">Browse vegetables <span aria-hidden="true">&#8594;</span></a></div></div><p id="cart-message" class="cart-message" role="status"></p>`;
    } else {
      cartItems.innerHTML = `${cart.map((item) => `<article class="cart-item" data-cart-key="${escapeHtml(item.key)}"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt)}" loading="lazy"><div class="cart-item-info"><h3>${escapeHtml(item.name)}</h3><p>${cartApi.formatWeight(item.grams)} pack · ${cartApi.formatMoney(item.unitPrice)} each</p><button class="remove-item" type="button" data-remove="${escapeHtml(item.key)}">Remove</button></div><div class="cart-quantity"><button type="button" data-step="-1" aria-label="Decrease quantity of ${escapeHtml(item.name)} ${cartApi.formatWeight(item.grams)}">−</button><span aria-live="polite">${item.quantity}</span><button type="button" data-step="1" aria-label="Increase quantity of ${escapeHtml(item.name)} ${cartApi.formatWeight(item.grams)}">+</button></div><strong class="cart-line-total">${cartApi.formatMoney(item.unitPrice * item.quantity)}</strong></article>`).join("")}<p id="cart-message" class="cart-message" role="status"></p>`;
    }
    const subtotal = cartApi.subtotal(cart);
    document.getElementById("cart-subtotal").textContent = cartApi.formatMoney(subtotal);
    document.getElementById("cart-total").textContent = cartApi.formatMoney(subtotal);
  }

  cartItems.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove]");
    const stepButton = event.target.closest("[data-step]");
    if (removeButton) cart = cartApi.removeItem(cart, removeButton.dataset.remove);
    if (stepButton) {
      const item = cart.find((entry) => entry.key === stepButton.closest("[data-cart-key]").dataset.cartKey);
      if (item) {
        const next = item.quantity + Number(stepButton.dataset.step);
        if (next < 1) cart = cartApi.removeItem(cart, item.key);
        else cartApi.setQuantity(cart, item.key, next);
      }
    }
    if (removeButton || stepButton) {
      saveCart();
      renderCart();
    }
  });

  const deliveryCheckbox = document.getElementById("delivery-required");
  const addressField = document.getElementById("address-field");
  const addressInput = addressField.querySelector("textarea");
  deliveryCheckbox.addEventListener("change", () => {
    addressField.classList.toggle("is-required", deliveryCheckbox.checked);
    addressInput.required = deliveryCheckbox.checked;
  });

  document.getElementById("checkout-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const errors = {};
    if (name.length < 2) errors.name = "Enter your name (at least 2 characters).";
    if (!email && !phone) errors.phone = "Add an email address or phone number so the business can contact you.";
    else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address or leave it blank and add a phone number.";
    if (deliveryCheckbox.checked && address.length < 5) errors.address = "Enter a delivery address or untick delivery required.";
    form.querySelectorAll(".field-error").forEach((node) => { node.textContent = errors[node.dataset.error] || ""; });
    form.querySelectorAll("input, textarea").forEach((field) => field.setAttribute("aria-invalid", errors[field.name] ? "true" : "false"));
    const message = document.getElementById("form-message");
    if (Object.keys(errors).length) {
      message.className = "form-message form-error";
      message.textContent = "Please check the highlighted fields.";
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }
    if (cart.length === 0) {
      message.className = "form-message form-error";
      message.textContent = "Your bag is empty. Add products before preparing an order request.";
      return;
    }
    message.className = "form-message form-success";
    message.textContent = `Details checked for ${cartApi.itemCount(cart)} item(s), estimated product subtotal ${cartApi.formatMoney(cartApi.subtotal(cart))}. Nothing has been sent or ordered. Contact ReadyKutVeggies directly to confirm details and arrange next steps.`;
  });

  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.getElementById("primary-nav");
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    menuToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !expanded);
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
    }
  });

  document.getElementById("current-year").textContent = new Date().getFullYear();
  renderProducts();
  renderCart();
})();
