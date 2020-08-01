const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: '',
            required: true,
            unique: '',
        },
        image: {
            type: String,
            default: '',
            required: true,
        },
        cost: {
            type: Number,
            default: 50,
        },
        description: {
            type: String,
            default: '',
        },
        featured: {
            type: Boolean,
            default: false,
        },
        veg: {
            type: Boolean,
            default: true,
        },
        places: {
            type: String,
            default: '',
            required: true,
        },
    },
    { timestamps: true }
);

const Dish = mongoose.model('Dish', dishSchema);

module.exports = Dish;
