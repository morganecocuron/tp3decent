const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    userId: String,
    products: [{ productId: String, quantity: Number }],
});

module.exports = mongoose.model("Cart", CartSchema);
