import axios from "axios";
import { showAlert } from "./alert";

export const initAdminTabs = () => {
  const sideNavItems = document.querySelectorAll(".side-nav__item");
  const sections = document.querySelectorAll(".admin-section");

  if (sideNavItems) {
    sideNavItems.forEach((item) => {
      item.addEventListener("click", () => {
        sideNavItems.forEach((el) =>
          el.classList.remove("side-nav__item--active")
        );
        sections.forEach((el) => el.classList.add("hidden"));

        item.classList.add("side-nav__item--active");

        const targetId = item.dataset.target;
        document.getElementById(targetId).classList.remove("hidden");
      });
    });
  }
};

export const deleteData = async (id, type) => {
  try {
    const confirmed = confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    // type 'meals' .'users' .'reviews'
    const res = await axios({
      method: "DELETE",
      url: `/api/v1/${type}/${id}`,
    });

    if (res.status === 204) {
      showAlert("success", "Deleted successfully!");
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    }
  } catch (err) {
    showAlert("error", "Error deleting item! Try again.");
  }
};
export const updateOrderStatus = async (id, status) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/bookings/${id}`,
      data: { status },
    });

    if (res.data.status === "success") {
      showAlert("success", "Order status updated successfully!");
    }
  } catch (err) {
    showAlert("error", "Error updating status");
    console.error(err);
  }
};
