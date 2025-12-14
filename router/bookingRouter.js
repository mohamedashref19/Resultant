const express = require("express");
const bookingControllers = require("./../controllers/bookingControllers");
const authControllers = require("./../controllers/authControllers");
const router = express.Router();

router.get(
  "/checkout-session/:mealId",
  authControllers.proctect,
  bookingControllers.getCheckoutSession
);
router.use(authControllers.proctect);
router.use(authControllers.restrictTO("admin"));
router.route("/").get(bookingControllers.getAllBookings);
router
  .route("/:id")
  .get(bookingControllers.getBooking)
  .patch(bookingControllers.updateBooking)
  .delete(bookingControllers.deleteBooking);
module.exports = router;
