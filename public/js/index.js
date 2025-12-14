import "@babel/polyfill";
import {
  login,
  logout,
  signup,
  forgotPassword,
  resetPassword,
  verifyOtp,
} from "./login";
import { updateSettings } from "./updateSetings";
import { createReview } from "./reviews";
import { bookMeal } from "./stripe";
import { initAdminTabs, deleteData, updateOrderStatus } from "./admin";
import { saveMeal } from "./mangeMeal";
const loginForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const signupForm = document.querySelector(".form--signup");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const photoInput = document.getElementById("photo");
const userPhotoPreview = document.querySelector(".form__user-photo");
const forgotPasswordForm = document.querySelector(".form--forgot-password");
const resetPasswordForm = document.querySelector(".form--reset-password");
const reviewForm = document.querySelector(".form--review");
const bookBtn = document.getElementById("book-meal");
const otpForm = document.querySelector(".form--otp");

if (photoInput) {
  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        userPhotoPreview.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener("click", logout);
}

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;

    signup(name, email, password, passwordConfirm);
  });
}

if (userDataForm) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);

    const photoInput = document.getElementById("photo");
    if (photoInput.files && photoInput.files[0]) {
      form.append("photo", photoInput.files[0]);
    }

    updateSettings(form, "data");
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.querySelector(".btn--save-password").textContent = "Updating...";

    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );

    document.querySelector(".btn--save-password").textContent = "Save password";
    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.querySelector(".btn--green");
    btn.textContent = "Sending...";

    const email = document.getElementById("email").value;
    forgotPassword(email);

    setTimeout(() => {
      btn.textContent = "Send Reset Link";
    }, 3000);
  });
}

if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.querySelector(".btn--reset-password");
    btn.textContent = "Updating...";

    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    const token = btn.dataset.token;

    resetPassword(token, password, passwordConfirm);
  });
}

if (reviewForm) {
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const ratingInput = document.querySelector('input[name="rate"]:checked');
    const rating = ratingInput ? ratingInput.value : 0;

    const review = document.getElementById("review").value;

    const mealId = reviewForm.dataset.mealId;

    if (!rating) {
      alert("Please select a star rating!");
      return;
    }

    const btn = reviewForm.querySelector("button");
    btn.textContent = "Submitting...";
    createReview(mealId, review, rating);
  });
}

if (bookBtn) {
  bookBtn.addEventListener("click", (e) => {
    e.preventDefault();

    bookBtn.textContent = "Processing...";

    const { mealId } = e.target.dataset;
    bookMeal(mealId);
  });
}

if (otpForm) {
  otpForm.addEventListener("submit", (e) => {
    e.preventDefault();

    //  /verify?email=test@test.com
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");

    const otp = document.getElementById("otp").value;

    verifyOtp(email, otp);
  });
}

const adminSidebar = document.querySelector(".admin-sidebar");
const deleteBtns = document.querySelectorAll(".btn-delete");
if (adminSidebar) {
  initAdminTabs();
}

if (deleteBtns) {
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const { id, type } = btn.dataset;
      deleteData(id, type);
    });
  });
}

const mealForm = document.querySelector(".form--meal-data");

if (mealForm) {
  mealForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const mealId = mealForm.dataset.id;
    const type = mealId ? "update" : "create";

    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("price", document.getElementById("price").value);
    form.append("description", document.getElementById("description").value);
    form.append("category", document.getElementById("category").value);

    const photoInput = document.getElementById("photo");
    if (photoInput.files[0]) {
      form.append("imageCover", photoInput.files[0]);
    }

    const btn = document.querySelector(".btn--green");
    btn.textContent = "Saving...";

    saveMeal(form, type, mealId);
  });
}

const statusSelects = document.querySelectorAll(".order-status");

if (statusSelects) {
  statusSelects.forEach((select) => {
    select.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      const status = e.target.value;

      updateOrderStatus(id, status);

      e.target.className = `order-status status-${status}`;
    });
  });
}
