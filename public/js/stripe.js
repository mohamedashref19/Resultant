import axios from "axios";
import { showAlert } from "./alert";
const stripe = window.Stripe(
  "pk_test_51SUqhpCEsT2n5ixkKhJbBopDmx0PfSjZ7ewiKNZL29WXB9GZebFQHFbwwekVJYBFL81w0Hx65kE9XSSAMvdAzZ9n00wlKYE7tj"
);

export const bookMeal = async (mealId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${mealId}`);

    // console.log(session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
export const bookCart = async (cart) => {
  try {
    const session = await axios.post("/api/v1/bookings/checkout-cart", {
      cart,
    });

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err.response.data.message);
  }
};
