const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    inStock: Boolean,
});

module.exports = mongoose.model("Product", ProductSchema);