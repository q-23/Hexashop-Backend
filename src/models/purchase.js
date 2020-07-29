const mongoose = require('mongoose');
const validator = require('validator');

const purchaseSchema = new mongoose.Schema({
	status: {
		type: String,
        required: true
	},
	receipt_url: {
		type: String,
        required: true
	},
	receipt_email: {
		type: String,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email is invalid.')
			}
		}
	},
	id: {
		type: String,
		required: true,
		unique: true
	},
	amount: {
		type: Number,
		required: true
	},
	customer_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	purchased_products: {
		type: Object,
		required: true
	},
	shipping: {
		type: Object,
		required: true
	}
}, {
	timestamps: true
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;