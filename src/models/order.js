const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	ordered_products: {
		type: [{
            product_id: mongoose.Schema.Types.ObjectId,
            count: Number
        }],
        required: true,
        validate(value) {
            if(!value.length) throw new Error('You must buy something to check out.')
        }
    },
    completed: {
        type: Boolean,
        default: false
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
	timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;