const express = require("express");
const userControllers = require("../controllers/userControllers");
const authControllers = require("./../controllers/authControllers");
const router = express.Router();

router.get("/Allusers", userControllers.getAlluser);
router.post("/signup", authControllers.signup);
router.post("/verifyOTP", authControllers.verifyOTP);
router.post("/login", authControllers.login);
router.get("/logout", authControllers.logout);
router.post("/forgetPassword", authControllers.forgetPassword);
router.patch("/resetPassword/:token", authControllers.resetPassword);

router.patch(
  "/updateMe",
  authControllers.proctect,
  userControllers.uploadimage,
  userControllers.rezieuserimage,
  userControllers.updateMe
);
router.delete("/deleteMe", authControllers.proctect, userControllers.deleteMe);
router.patch(
  "/updatePassword",
  authControllers.proctect,
  authControllers.updatePassword
);

module.exports = router;
