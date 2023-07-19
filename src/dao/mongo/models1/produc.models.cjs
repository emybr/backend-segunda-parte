


const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    creatorEmail: {
        type: String,
        required: true,
    },
    creatorRole: {
        type: String,
        required: true,
    },
});

const ProductModels = mongoose.model('Product', productSchema);

module.exports = ProductModels;
