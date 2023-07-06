const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    edad: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    cartId: {
        type: [String], 
        default: [], 
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    files: {
        type: [String]
    }
});

const UserModels = mongoose.model('User', userSchema);

module.exports = UserModels;