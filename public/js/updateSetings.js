/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alert";
export const updateSettings = async (data, type) => {
  const url =
    type === "password"
      ? "/api/v1/users/updatePassword"
      : "/api/v1/users/updateMe";
  try {
    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    // console.log(res);
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} date successfuly`);
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
