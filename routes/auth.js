const express = require("express");
const router = express.Router();

const isAuth = require("../middleware/is-auth");

// validator
const { check, body } = require("express-validator/lib");
// check look anywhere
// body look in the body of the request

const authController = require("../controllers/auth");
router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);
// customize error message (withMessage)
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .custom((value, { req }) => {
        if (value === "test@test.com") {
          throw new Error("This email address is forbidden.");
        }
        return true;
      }),

    body(
      "password",
      "Please enter a password with only numbers and text and at least 6 characters."
    )
      .isLength({ min: 6 })
      .isAlphanumeric(),

    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password not matched!");
      }

      return true;
    }),
  ],
  authController.postSignup
);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
