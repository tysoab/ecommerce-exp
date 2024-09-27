exports.get404 = (req, res, next) => {
  // get cookie
  // const isLoggedIn = req.get("Cookie").split(";")[1].trim().split("=")[1];
  res
    .status(404)
    .render("404", {
      pageTitle: "Page Not Found",
      path: "/404",
      isAuthenticated: req.session.isLoggedIn,
    });
};
