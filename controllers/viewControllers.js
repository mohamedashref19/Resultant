const Meal = require("./../model/mealsModel");
const Booking = require("./../model/bookingModel");
const Review = require("./../model/reviewModel");
const User = require("./../model/usermodel");
const catchAsync = require("../utils/catchAsync");

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === "booking") {
    res.locals.alert =
      "Your booking was successful! Please check your email for confirmation. If your booking doesn't show up immediately, please come back later.";
  }
  next();
};

exports.getAdminDashboard = catchAsync(async (req, res, next) => {
  const meals = await Meal.find();
  const users = await User.find();
  const bookings = await Booking.find().populate("user").populate("meal");
  const reviews = await Review.find().populate("user").populate("meal");
  res.status(200).render("admin", {
    title: "Admin Dashboard",
    meals,
    users,
    bookings,
    reviews,
  });
});

exports.getOverView = catchAsync(async (req, res, next) => {
  const meals = await Meal.find().sort({ ratingsAverage: -1 }).limit(5);
  res.status(200).render("overview", {
    title: "Top Rated Meals",
    meals,
  });
});
exports.getAllMenu = catchAsync(async (req, res, next) => {
  const meals = await Meal.find();
  res.status(200).render("overview", {
    title: "Full Menu",
    meals,
    isMenuPage: true,
  });
});
exports.getMeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  res.status(200).render("meal", {
    title: meal.name,
    meal,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
};
exports.getSignupForm = (req, res) => {
  res.status(200).render("signup", {
    title: "Create your account",
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your Account",
  });
};

exports.getForgotPasswordForm = (req, res) => {
  res.status(200).render("forgot-password", {
    title: "Forgot your password?",
  });
};
exports.getResetPasswordForm = (req, res) => {
  res.status(200).render("resetPassword", {
    title: "Reset your password",
    token: req.params.token,
  });
};

exports.getMyMeal = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const mealIds = bookings.map((el) => el.meal);
  const meals = await Meal.find({ _id: { $in: mealIds } });

  res.status(200).render("overview", {
    title: "My Bookings",
    meals,
    isBookings: true,
  });
});

exports.getOtp = (req, res) => {
  res.status(200).render("otp", {
    title: "Verfiy Email ",
  });
};

exports.getCreateMealForm = (req, res) => {
  res.status(200).render("manageMeal", {
    title: "Create New Meal",
  });
};

exports.getEditMeal = catchAsync(async (req, res, next) => {
  const meal = await Meal.findById(req.params.id);
  if (!meal) {
    return next(new AppError("There is no meal with that name.", 404));
  }
  res.status(200).render("manageMeal", {
    title: `Edit ${meal.name}`,
    meal,
  });
});
