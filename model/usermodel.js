const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "admin", "delivery", "kitchen"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    // This only works on CREATE and SAVE!!!
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  changepasswordAt: Date,
  passwordresetToken: String,
  resetpasswordTokenExpire: Date,
  active: {
    type: Boolean,
    default: true,
    // select: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpires: Date,
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcryptjs.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return;
  this.changepasswordAt = Date.now() - 1000;
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userpassword
) {
  return await bcryptjs.compare(candidatePassword, userpassword);
};

userSchema.methods.changepassword = function (JWTTime) {
  if (this.changepasswordAt) {
    const changetime = parseInt(this.changepasswordAt.getTime() / 1000, 10);
    return JWTTime < changetime;
  }

  //password NOT change
  return false;
};

userSchema.methods.createResetpasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordresetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetpasswordTokenExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
