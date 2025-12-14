const nodemailer = require("nodemailer");
const { convert } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Mohamed Ashref <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // SendGrid
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    }

    // Mailtrap (Development)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(subject, htmlContent) {
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: htmlContent,
      text: convert(htmlContent),
    };

    await this.newTransport().sendMail(emailOptions);
  }

  async sendWelcome() {
    const html = `
      <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-family: sans-serif;">
        <h2 style="color: teal;">Welcome to the Family!</h2>
        <p>Hello ${this.firstName},</p>
        <p>Welcome to our restaurant app, we're glad to have you 🎉</p>
        <a href="${this.url}" style="background: crimson; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Go to Profile</a>
      </div>
    `;
    await this.send("Welcome to the Family!", html);
  }

  async sendPasswordReset() {
    const html = `
      <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-family: sans-serif;">
        <h2 style="color: #c0392b;">Password Reset</h2>
        <p>Hello ${this.firstName},</p>
        <p>Forgot your password? Click the button below to reset it (valid for 10 mins).</p>
        <a href="${this.url}" style="background: #2c3e50; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Reset Password</a>
        <p>If you didn't forget your password, please ignore this email.</p>
      </div>
    `;
    await this.send("Your password reset token", html);
  }

  async sendBookingConfirmation(mealName, price) {
    const html = `
      <div style="max-width: 700px; margin:auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px; font-family: sans-serif;">
        <div style="background-color: #55c57a; padding: 20px; text-align: center; color: white;">
          <h1>Order Confirmed! ✅</h1>
        </div>
        <div style="padding: 20px;">
          <h3>Hello ${this.firstName},</h3>
          <p>Thank you for your order. We have received your payment.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 5px 0;"><strong>Meal:</strong> ${mealName}</p>
            <p style="margin: 5px 0;"><strong>Total Price:</strong> $${price}</p>
          </div>

          <p>We hope you enjoy your meal! 😋</p>
          <a href="${this.url}" style="display: block; width: 200px; margin: 20px auto; text-align: center; background: #55c57a; color: white; padding: 12px; text-decoration: none; border-radius: 50px;">View My Orders</a>
        </div>
      </div>
    `;
    await this.send(`Order Confirmation: ${mealName}`, html);
  }
  async sendOTP(otpCode) {
    const html = `
      <div style="max-width: 600px; margin: auto; padding: 20px; font-family: sans-serif; border: 1px solid #ddd; text-align: center;">
        <h2>🔐 Verify Your Account</h2>
        <p>Hello ${this.firstName},</p>
        <p>Your verification code is:</p>
        <h1 style="color: #ff6b6b; letter-spacing: 5px; background: #eee; padding: 10px; display: inline-block;">${otpCode}</h1>
        <p>This code is valid for 10 minutes.</p>
      </div>
    `;

    await this.send("Your Verification Code (OTP)", html);
  }
};
