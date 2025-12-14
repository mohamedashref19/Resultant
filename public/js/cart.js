export const addToCart = (meal) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingItemIndex = cart.findIndex(
    (item) => String(item.id) === String(meal.id)
  );
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
    alert("Quantity updated! Now you have " + cart[existingItemIndex].quantity);
  } else {
    meal.quantity = 1;
    cart.push(meal);
    alert("Meal added to cart successfully!");
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
};

export const getCart = () => {
  return JSON.parse(localStorage.getItem("cart")) || [];
};

export const updateCartBadge = () => {
  const cart = getCart();
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const badge = document.getElementById("cart-badge");
  if (badge) badge.textContent = totalQuantity;
};
