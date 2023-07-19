const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    purchase_datetime: {
        type: Date,
        default: Date.now,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true
    }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;

