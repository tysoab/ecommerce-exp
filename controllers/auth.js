const User = require("../models/user");
const bcrypt = require("bcryptjs");

// generate a token
const crypto = require("crypto");

// validator
const { validationResult } = require("express-validator/lib");

// node mailer
const nodemailer = require("nodemailer");

// initialize node mailer transporter: tell node how email will be delivered
// Looking to send emails in production? Check out our Email API/SMTP product!
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "e4baad1bca730d",
    pass: "46738833ce9075",
  },
});

exports.getLogin = (req, res, next) => {
  // get cookie
  // const isLoggedIn = req.get("Cookie").split(";")[3].trim().split("=")[1];

  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: { email: "" },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  // set cookie
  // res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly");

  // session
  const { email, password } = req.body;
  // validate user input
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // flash error msg
        // req.flash("error", "Record not found!");
        // return res.redirect("/login");
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid user record",
          oldInput: { email: email },
          validationErrors: errors.array(),
        });
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            // to be sure session is save b4 redirect
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          // req.flash("error", "Record not found!");
          // res.redirect("/login");
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid user record",
            oldInput: { email: email },
            validationErrors: [], // errors.array(),
          });
        })
        .catch((err) => {
          console.log(err);
          return res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: { email: "", password: "" },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  // validate user input
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }
  // User.findOne({ email: email })
  //   .then((userDoc) => {
  //     if (userDoc) {
  //       req.flash(
  //         "error",
  //         "Email Address already exist!, try a new Email Address"
  //       );
  //       return res.redirect("/signup");
  //     }

  // hash password
  // return bcrypt
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });

      return user.save();
    })
    .then((result) => {
      res.redirect("/login");

      // Configure the mailoptions object
      const mailOptions = {
        from: "taiwoyusufsunday@gmail.com",
        to: email,
        subject: "Sending Email using Node.js",
        // text: "That was easy!",
        html: `<h1>You successfully signed up!</h1>`,
      };
      // Send the email
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Error:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    });
  // })

  // .catch((err) => {
  //   console.log(err);
  // });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  // crypto create a secure unique random value
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        // Configure the mailoptions object
        const mailOptions = {
          from: "taiwoyusufsunday@gmail.com",
          to: req.body.email,
          subject: "Password reset",
          // text: "That was easy!",
          html: `
          <h1>You requested a password reset</h1>
          <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password</p>
          `,
        };
        // Send the email
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log("Error:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

// reset password
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }

      let message = req.flash("error");

      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const { newPassword, userId, passwordToken } = req.body;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
