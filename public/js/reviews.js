import axios from "axios";
import { showAlert } from "./alert";

export const createReview = async (mealId, review, rating) => {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/meals/${mealId}/reviews`,
      data: {
        review,
        rating,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Review submitted successfully!");
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
