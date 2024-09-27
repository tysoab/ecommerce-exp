const mongoose = require("mongoose");

// create a new schema
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    require: true,
  },

  price: {
    type: Number,
    require: true,
  },

  description: {
    type: String,
    require: true,
  },

  imageUrl: {
    type: String,
    require: true,
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User", //name of user model
    require: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
