const express = require("express");
const authControllers = require("./../controllers/authControllers");
const reviewControllers = require("./../controllers/reviewControllers");

const router = express.Router({ mergeParams: true });

router.route("/").get(reviewControllers.getAllReviews);

router.use(authControllers.proctect);

router
  .route("/")
  .post(authControllers.restrictTO("user"), reviewControllers.createReview);
router
  .route("/:id")
  .patch(
    authControllers.restrictTO("user", "admin"),
    reviewControllers.updateReview
  )
  .delete(
    authControllers.restrictTO("user", "admin"),
    reviewControllers.deleteReview
  );

module.exports = router;
