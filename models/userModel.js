const mongoose = require("mongoose");
const orderSchema = require('./orderModel');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "",
    required: true,
  },
  email: {
    type: String,
    default: "",
    required: true,
    unique: true,
  },
  password: {
    type: String,
    default: "",
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  veg: {
    type: Boolean,
    default: true,
    required: true,
  },
  orders: [ orderSchema ]
});

var User = mongoose.model("User", userSchema);

module.exports = User;
