(function (root) {
  "use strict";

  function addItem(cart, product, grams, quantity) {
    const pack = product.packs.find((item) => item.grams === Number(grams));
    if (!pack) throw new Error("Choose a valid pack size.");
    const count = Number(quantity);
    if (!Number.isInteger(count) || count < 1 || count > 99) throw new Error("Quantity must be between 1 and 99.");
    const key = `${product.id}:${pack.grams}`;
    const existing = cart.find((item) => item.key === key);
    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + count);
      return cart;
    }
    cart.push({ key, id: product.id, name: product.name, grams: pack.grams, unitPrice: pack.price, quantity: count, image: product.image, alt: product.alt });
    return cart;
  }

  function setQuantity(cart, key, quantity) {
    const count = Number(quantity);
    if (!Number.isInteger(count) || count < 1 || count > 99) throw new Error("Quantity must be between 1 and 99.");
    const item = cart.find((entry) => entry.key === key);
    if (item) item.quantity = count;
    return cart;
  }

  function removeItem(cart, key) {
    return cart.filter((item) => item.key !== key);
  }

  function itemCount(cart) {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function subtotal(cart) {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  function formatMoney(amount) {
    return `R${Number(amount).toFixed(2)}`;
  }

  function formatWeight(grams) {
    return grams >= 1000 && grams % 1000 === 0 ? `${grams / 1000} kg` : `${grams} g`;
  }

  root.ReadyKutCart = { addItem, setQuantity, removeItem, itemCount, subtotal, formatMoney, formatWeight };
  if (typeof module !== "undefined" && module.exports) module.exports = root.ReadyKutCart;
})(typeof window !== "undefined" ? window : globalThis);
