const express = require("express");
const router = express.Router();
const { signupValidation } = require("../Auth/Validation");

const { loginvalidation } = require("../Auth/Validation");
const { validationResult } = require("express-validator");
const UserModel = require("../models/user.model");
const sendEmail = require("../utils/SendEmail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
// Handle signup form submission


// ... saare imports ke baad ...

// Yeh hamara security guard hai
const isAuth = (req, res, next) => {
    // Guard check karta hai: "Kya is user ke paas stamp (session) hai?"
    if (req.session.isLoggedIn) {
        // Agar stamp hai, to guard kehta hai "Aage jao"
        next();
    } else {
        // Agar stamp nahi hai, to guard use wapas login page par bhej deta hai
        res.redirect('/user/login');
    }
}

// ... baaki ke routes ...

router.get("/signup", (req, res) => {
  res.render("Sign-up");
});

router.get("/login", (req, res) => {
  res.render("Login");
});

router.get("/forgot-password", (req, res) => {
  res.render("Forgot");
});

// YEH NAYA AUR SAHI ROUTE HAI
router.get("/reset-password/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const user = await UserModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.send(
        "Aapka password reset token ya to galat hai ya expire ho chuka hai."
      );
    }

    res.render("Reset", { token: token });
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// 1. Route ke path mein :token add karein
router.post("/reset-password/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const user = await UserModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.send(
        "Aapka password reset token ya to galat hai ya expire ho chuka hai."
      );
    }

    // Naya password update karein
    user.password = req.body.password;

    // 4. Token ko "use up" kar dein
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // 3. Pehle hamesha save karein
    await user.save();

    // 2. Uske baad sirf ek response (redirect) bhejein
    res.redirect("/user/login");
    const subject = "Password Successfully Reset";
    const htmlMessage = `
            <h1>Password Reset Successful</h1>
            <p>Your password has been successfully reset.</p>
            <p>If you did not perform this action, please contact support immediately.</p>
        `;
    await sendEmail(user.email, subject, htmlMessage);
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send("An error occurred while resetting the password.");
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log(email);

  const user = await UserModel.findOne({ email: email });
  console.log("DATABASE SE MILA USER OBJECT:", user);
  if (!user) {
    console.log(`User not found for email: ${email}`);

    return res.send(
      "If your email is registered, you will receive a password reset link."
    );
  }
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
  await user.save();

  console.log(`Email request received for: ${email}`);
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/user/reset-password/${resetToken}`;

  const subject = "Password Reset Link (Valid for 5 minutes) ";
  const htmlMessage = `
           <h1>Password Reset Link</h1>
            <p>Yeh link sirf 5 minute ke liye valid hai.</p>
            <a href="${resetURL}">Reset Your Password</a>
        `;

  await sendEmail(user.email, subject, htmlMessage);
  res.send("Password reset email sent if the email exists in our system.");
  console.log(req.body);
});

// Correct path should be '/signup' (since this router is mounted at '/user')
router.post("/signup", signupValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password } = req.body;
  await UserModel.create({
    fullName: fullName,
    email: email,
    password: password,
  });
  const subject = "Welcome to Auth App";
  const htmlMessage = `
           <h1>Welcome to Auth App</h1>
            <p>Thank you for registering with us.</p>
            <p>We're excited to have you on board!</p>
        `;
  await sendEmail(email, subject, htmlMessage);
  res.send("User registered successfully! Please check your email.");

  console.log(req.body);
});

router.post("/login", loginvalidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email: email });
        if (!user) {
        return res.status(400).send("Is email se koi user registered nahi hai.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
        req.session.isLoggedIn = true;
        req.session.user = {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
        };
        const subject = "Login Successful";
        const htmlMessage = `
            <h1>Login Successful</h1>
                <p>You have successfully logged in to your account.</p>
                <p>If this wasn't you, please reset your password immediately.</p>
            `;
        sendEmail(req.body.email, subject, htmlMessage);

        req.session.save((err) => {
            if (err) {
            console.log(err);
            }
            res.redirect("/user/dashboard");
        });
        } else {
        return res.status(400).send("Aapka password galat hai.");
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Server Error");
    }
    });

    router.get("/dashboard",isAuth, (req, res) => {
        const loggedInUser = req.session.user;
     res.render('dashboard', { user: loggedInUser });
    })

       



    router.post('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                console.log(err);
            }
            res.redirect('/user/login');
        });
    });


module.exports = router; // You can add user-related routes here in the future
