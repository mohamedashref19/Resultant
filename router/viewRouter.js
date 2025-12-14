const express = require("express");
const viewControllers = require("./../controllers/viewControllers");
const authcontrollers = require("./../controllers/authControllers");
const bookingControllers = require("./../controllers/bookingControllers");

const router = express.Router();
router.use(viewControllers.alerts);

// router.get(
//   "/",
//   bookingControllers.createBookingCheckout,
//   authcontrollers.isLoggedIn
// );
router.get("/menu", authcontrollers.isLoggedIn, viewControllers.getAllMenu);
router.get("/verify", viewControllers.getOtp);
router.use(authcontrollers.isLoggedIn);
router.route("/").get(viewControllers.getOverView);
router.get("/meal/:slug", viewControllers.getMeal);
router.get("/login", viewControllers.getLoginForm);
router.get("/signup", viewControllers.getSignupForm);
router.get("/forgotPassword", viewControllers.getForgotPasswordForm);
router.get("/resetPassword/:token", viewControllers.getResetPasswordForm);
router.get("/me", authcontrollers.proctect, viewControllers.getAccount);
router.get("/my-bookings", authcontrollers.proctect, viewControllers.getMyMeal);
router.get(
  "/admin",
  authcontrollers.proctect,
  authcontrollers.restrictTO("admin"),
  viewControllers.getAdminDashboard
);
router.get("/cart", authcontrollers.isLoggedIn, (req, res) => {
  res.status(200).render("cart", { title: "My Cart" });
});
router.get(
  "/create-meal",
  authcontrollers.proctect,
  authcontrollers.restrictTO("admin"),
  viewControllers.getCreateMealForm
);

router.get(
  "/edit-meal/:id",
  authcontrollers.proctect,
  authcontrollers.restrictTO("admin"),
  viewControllers.getEditMeal
);
module.exports = router;
