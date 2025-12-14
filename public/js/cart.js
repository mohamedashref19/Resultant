export const addToCart = (meal) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existingMeal = cart.find((item) => item.id === meal.id);
  if (existingMeal) return alert("This meal is already in your cart!");

  cart.push(meal);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Meal added to cart successfully!");
  updateCartBadge();
};

export const getCart = () => {
  return JSON.parse(localStorage.getItem("cart")) || [];
};

export const updateCartBadge = () => {
  const cart = getCart();
  const badge = document.getElementById("cart-badge");
  if (badge) badge.textContent = cart.length;
};
