const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const multer = require("multer");

const MONGODB_URI =
  "mongodb+srv://tysoab:Tysoabolutee@cluster0.ugql4.mongodb.net/mongoose_shop?retryWrites=true&w=majority&appName=Cluster0";

// mongoose connect

const app = express();
// initialize mongodbstore
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// initialize csurf
const csrfProtection = csrf();
const todayDate = Date.now();
// file storage
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, todayDate + "-" + file.originalname);
  },
});

// file filter
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(multer({ dest: "images" }).single("image")); // name use in the file input tag inside a form
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

// session
app.use(
  session({
    secret: "my secrete",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// use csrf protection
app.use(csrfProtection);

// register flash after you initialize a session
app.use(flash());

// things that is common to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// user middleware
app.use((req, res, next) => {
  // console.log("user", req);
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }

      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

// error middleware
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect("/500");
  // console.log(req);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

// connection
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
