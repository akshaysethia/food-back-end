const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema ({
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    },
    quantity: {
        type: Number,
        default: 0
    }
});

module.exports = orderSchema;