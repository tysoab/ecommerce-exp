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

const MONGODB_URI =
  "mongodb+srv://tysoab:Tysoabolutee@cluster0.ugql4.mongodb.net/mongoose_shop?retryWrites=true&w=majority&appName=Cluster0";

// mongoose connect
const mongoose = require("mongoose");

const app = express();
// initialize mongodbstore
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// initialize csurf
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

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

// user middleware
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

// things that is common to all views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

// connection
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    // User.findOne().then((user) => {
    //   if (!user) {
    //     const user = new User({
    //       name: "Taiwo Yusuf",
    //       email: "tysoab@gmail.com",
    //       cart: { items: [] },
    //     });
    //     user.save();
    //   }
    // });

    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
