import axios from "axios";
import { showAlert } from "./alert";

export const saveMeal = async (data, type, mealId) => {
  try {
    const url = type === "create" ? "/api/v1/meals" : `/api/v1/meals/${mealId}`;

    const method = type === "create" ? "POST" : "PATCH";

    const res = await axios({
      method,
      url,
      data,
    });

    if (res.data.status === "success") {
      showAlert(
        "success",
        `Meal ${type === "create" ? "created" : "updated"} successfully!`
      );
      window.setTimeout(() => {
        location.assign("/admin");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
