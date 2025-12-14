const express = require("express");
const mealsControllers = require("./../controllers/mealsControllers");
const authControllers = require("./../controllers/authControllers");
const reviewRouter = require("./reviewRouter");
const router = express.Router();
router.use("/:mealId/reviews", reviewRouter);
router
  .route("/")
  .get(mealsControllers.getAll)
  .post(
    authControllers.proctect,
    authControllers.restrictTO("admin"),
    mealsControllers.uploadImage,
    mealsControllers.resizeImage,
    mealsControllers.createmeal
  );

router
  .route("/:id")
  .get(mealsControllers.getone)
  .patch(
    authControllers.proctect,
    authControllers.restrictTO("admin"),
    mealsControllers.uploadImage,
    mealsControllers.resizeImage,
    mealsControllers.updatemeal
  )
  .delete(
    authControllers.proctect,
    authControllers.restrictTO("admin"),
    mealsControllers.deletemeal
  );

module.exports = router;
