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
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/my-bookings?alert=booking`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.mealId,
    metadata: { type: "single", userId: req.user.id, price: meal.price },
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: meal.price * 100,
          product_data: {
            name: `${meal.name} Meal`,
            description: meal.summary,
            images: [
              `https://restaurant-muddy-shadow-3798.fly.dev/img/meals/${meal.imageCover}`,
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

exports.getCartCheckoutSession = catchAsync(async (req, res, next) => {
  const cart = req.body.cart;
  const lineItems = cart.map((item) => ({
    price_data: {
      currency: "usd",
      unit_amount: item.price * 100,
      product_data: {
        name: `${item.name} Meal`,
        description: item.summary,
        images: [
          `https://restaurant-muddy-shadow-3798.fly.dev/img/meals/${item.image}`,
        ],
      },
    },
    quantity: item.quantity,
  }));
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/my-bookings?alert=booking`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.user.id,
    metadata: { type: "cart" },
    mode: "payment",
    line_items: lineItems,
  });

  res.status(200).json({ status: "success", session });
});

const createBookingCheckout = async (session) => {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const userId =
    session.metadata.type === "cart"
      ? session.client_reference_id
      : session.metadata.userId;

  const orderedMeals = [];

  for (const item of lineItems.data) {
    const mealName = item.description.replace(" Meal", "").trim();
    const meal = await Meal.findOne({ name: mealName });
    if (meal) {
      const quantity = item.quantity || 1;
      orderedMeals.push(`${quantity}x ${item.description}`);
      for (let i = 0; i < item.quantity; i++) {
        await Booking.create({
          meal: meal._id,
          user: userId,
          price: item.amount_total / quantity / 100,
        });
      }
    }
  }
  const allMealsText = orderedMeals.join(" - ");
  try {
    const userDoc = await User.findById(userId);
    const myBookingsUrl = `https://restaurant-muddy-shadow-3798.fly.dev/my-bookings`;
    await new Email(userDoc, myBookingsUrl).sendBookingConfirmation(
      allMealsText,
      session.amount_total / 100
    );
  } catch (err) {
    console.log("Error sending email:", err);
  }
};
exports.webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    createBookingCheckout(event.data.object);
  }
  res.status(200).json({ received: true });
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
