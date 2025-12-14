const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const helmet = require("helmet");

// Routers
const userRouter = require("./router/userRouter");
const mealRouter = require("./router/mealRouter");
const orderRouter = require("./router/orderRouter");
const reviewRouter = require("./router/reviewRouter");
const viewRouter = require("./router/viewRouter");
const bookingRouter = require("./router/bookingRouter");
const bookingController = require("./controllers/bookingControllers");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorControllers");

const app = express();
app.set("trust proxy", 1);
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  bookingController.webhookCheckout
);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
// Set security HTTP headers

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", "data:", "blob:", "https:", "ws:"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      scriptSrc: [
        "'self'",
        "https:",
        "http:",
        "blob:",
        "https://js.stripe.com",
        "https://m.stripe.network",
        "https://*.cloudflare.com",
      ],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      workerSrc: ["'self'", "data:", "blob:", "https://m.stripe.network"],
      childSrc: ["'self'", "blob:"],
      imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com"],
      formAction: ["'self'"],
      connectSrc: [
        "'self'",
        "'unsafe-inline'",
        "data:",
        "blob:",
        "https://api.stripe.com",
        "https://*.stripe.com",
        "https://bundle.js:*",
        "ws://127.0.0.1:*/",
      ],
      upgradeInsecureRequests: [],
    },
  })
);
// 1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());

//for Cookies
app.use(cookieParser());

//limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "to Many request from same IP try again later after One hour",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
// Data sanitization against NoSQL query injection {"$gt": ""})
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
app.use(compression());

app.use((req, res, next) => {
  console.log("Hello from the middleware 👋");
  next();
});

//2) ROUTES
app.use("/", viewRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/meals", mealRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
