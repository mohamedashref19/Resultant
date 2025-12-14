const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Meal = require("./../model/mealsModel");
const User = require("./../model/usermodel");
const Booking = require("./../model/bookingModel");
const Email = require("./../utils/email");
const AppError = require("./../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const meal = await Meal.findById(req.params.mealId);
  if (!meal) {
    return next(new AppError("No meal found with that ID", 404));
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/?meal=${
      req.params.mealId
    }&user=${req.user.id}&price=${meal.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/meal/${meal.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.mealId,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: meal.price * 100,
          product_data: {
            name: `${meal.name} Meal`,
            description: meal.summary,
            // images: [
            //   `${req.protocol}://${req.get("host")}/img/meals/${
            //     meal.imageCover
            //   }`,
            // ],
            images: [
              "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            ],
          },
        },
        quantity: 1,
      },
    ],
  });
  res.status(200).json({
    status: "success",
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { meal, user, price } = req.query;
  if (!meal || !user || !price) return next();
  await Booking.create({
    meal,
    user,
    price,
  });

  const userDoc = await User.findById(user);
  const mealDoc = await Meal.findById(meal);
  const myBookingsUrl = `${req.protocol}://${req.get("host")}/my-booking`;
  try {
    await new Email(userDoc, myBookingsUrl).sendBookingConfirmation(
      mealDoc.name,
      price
    );
  } catch (err) {
    console.log("Error sending email:", err);
  }

  res.redirect(req.originalUrl.split("?")[0]);
});

exports.updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!booking) {
    return next(new AppError("there is no booking with ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});
exports.deleteBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    return next(new AppError("there is no booking with ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
exports.getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find();

  res.status(200).json({
    status: "success",
    data: {
      bookings,
    },
  });
});

exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return next(new AppError("there is no booking with ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});
