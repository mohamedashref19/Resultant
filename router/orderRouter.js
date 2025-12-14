const express = require("express");
const authControllers = require("./../controllers/authControllers");
const orderControllers = require("./../controllers/orderControllers");

const router = express.Router({ mergeParams: true });
router.use(authControllers.proctect);

router
  .route("/")
  .get(orderControllers.getAllOrder)
  .post(orderControllers.createOrder);

router.get(
  "/stats/general",
  authControllers.restrictTO("admin"),
  orderControllers.getGeneralStats
);
router.get(
  "/stats/sales",
  authControllers.restrictTO("admin"),
  orderControllers.getOrderStats
);

router.get(
  "/stats/bestsellers",
  authControllers.restrictTO("admin"),
  orderControllers.getBestSellers
);

router.route("/:id/cancel").patch(orderControllers.cancelMyOrder);

router
  .route("/:id")
  .get(orderControllers.getOrder)
  .patch(
    authControllers.restrictTO("admin", "kitchen", "delivery"),
    orderControllers.updateOrderStatus
  )
  .delete(authControllers.restrictTO("admin"), orderControllers.deleteOrder);

module.exports = router;
