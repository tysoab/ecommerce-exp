const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  // // get cookie
  // const isLoggedIn = req.get("Cookie").split(";")[1].trim().split("=")[1];

  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log("created");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const deleteMode = req.body._delete;
  const prodId = req.body.id;

  if (!deleteMode) {
    res.redirect("/admin/products");
  }
  {
    Product.deleteOne({ _id: prodId, userId: req.user._id })
      .then((result) => {
        res.redirect("/admin/products");
      })
      .catch((err) => console.log(err));
  }
};

exports.getEditProduct = (req, res, next) => {
  // get cookie
  // const isLoggedIn = req.get("Cookie").split(";")[1].trim().split("=")[1];
  // query parameter
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.id;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;
  // const userId = req.user._id;

  Product.findById(prodId)
    .then((product) => {
      // authorize user
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;

      return product.save().then((result) => {
        res.redirect("/admin/products");
      });
    })

    .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
  // get cookie
  // const isLoggedIn = req.get("Cookie").split(";")[1].trim().split("=")[1];

  Product.find({ userId: req.user._id })
    // .populate("userId")
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
