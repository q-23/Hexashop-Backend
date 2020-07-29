class Stripe {
}
const stripe = jest.fn(() => new Stripe());

Stripe.prototype.customers = {
	create() {
		return {
			customer: {
				id: 'cus_HjsX9LOS3I7mci',
				object: 'customer',
				address: null,
				balance: 0,
				created: 1596065627,
				currency: null,
				default_source: 'asdasdasasd',
				delinquent: false,
				description: null,
				discount: null,
				email: 'aleksdfsd@asd.om',
				invoice_prefix: '2D73FEF4',
				invoice_settings: { custom_fields: null, default_payment_method: null, footer: null },
				livemode: false,
				metadata: {},
				name: null,
				next_invoice_sequence: 1,
				phone: null,
				preferred_locales: [],
				shipping: null,
				sources: {
					object: 'list',
					data: [ [Object] ],
					has_more: false,
					total_count: 1,
					url: '/v1/customers/cus_HjsX9LOS3I7mci/sources'
				},
				subscriptions: {
					object: 'list',
					data: [],
					has_more: false,
					total_count: 0,
					url: '/v1/customers/cus_HjsX9LOS3I7mci/subscriptions'
				},
				tax_exempt: 'none',
				tax_ids: {
					object: 'list',
					data: [],
					has_more: false,
					total_count: 0,
					url: '/v1/customers/cus_HjsX9LOS3I7mci/tax_ids'
				}
			}
		}
	}
};

Stripe.prototype.charges = {
	create() {
		return {
				id: 'ch_1HAOoSIepphit2IQiJC6ClA3',
				object: 'charge',
				amount: 86025,
				amount_refunded: 0,
				application: null,
				application_fee: null,
				application_fee_amount: null,
				balance_transaction: 'txn_1HAOoTIepphit2IQmwAkdzPI',
				billing_details: {
					address: {
						city: 'Olsztyn',
						country: 'Poland',
						line1: 'yjtre',
						line2: null,
						postal_code: '11-117',
						state: null
					},
					email: null,
					name: 'AlAsd Afkowski',
					phone: null
				},
				calculated_statement_descriptor: 'WOOCOMMERCE',
				captured: true,
				created: 1596065756,
				currency: 'usd',
				customer: 'cus_HjsZAPttl4fI1E',
				description: 'Purchase',
				destination: null,
				dispute: null,
				disputed: false,
				failure_code: null,
				failure_message: null,
				fraud_details: {},
				invoice: null,
				livemode: false,
				metadata: {},
				on_behalf_of: null,
				order: null,
				outcome: {
					network_status: 'approved_by_network',
					reason: null,
					risk_level: 'normal',
					risk_score: 55,
					seller_message: 'Payment complete.',
					type: 'authorized'
				},
				paid: true,
				payment_intent: null,
				payment_method: 'card_1HAOoPIepphit2IQaaHUKIGZ',
				payment_method_details: {
					card: {
						brand: 'visa',
						checks: [Object],
						country: 'US',
						exp_month: 11,
						exp_year: 2022,
						fingerprint: 'Szgr6okljA1rImen',
						funding: 'credit',
						installments: null,
						last4: '4242',
						network: 'visa',
						three_d_secure: null,
						wallet: null
					},
					type: 'card'
				},
				receipt_email: 'aleksa@ss.ail.com',
				receipt_number: null,
				receipt_url: 'https://pay.stripe.com/receipts/',
				refunded: false,
				refunds: {
					object: 'list',
					data: [],
					has_more: false,
					total_count: 0,
					url: '/v1/charges/ch_1HAOoSIepphit2IQiJC6ClA3/refunds'
				},
				review: null,
				shipping: {
					address: {
						city: 'Olsztyn',
						country: 'Poland',
						line1: 'yjtre',
						line2: null,
						postal_code: '10-387',
						state: null
					},
					carrier: null,
					name: 'Alewr Aowski',
					phone: null,
					tracking_number: null
				},
				source: {
					id: 'card_1HAOoPIepphit2IQaaHUKIGZ',
					object: 'card',
					address_city: 'Olsztyn',
					address_country: 'Poland',
					address_line1: 'yjtre',
					address_line1_check: 'pass',
					address_line2: null,
					address_state: null,
					address_zip: '10-611',
					address_zip_check: 'pass',
					brand: 'Visa',
					country: 'US',
					customer: 'cus_HjsZAPttl4fI1E',
					cvc_check: 'pass',
					dynamic_last4: null,
					exp_month: 11,
					exp_year: 2022,
					fingerprint: 'Szgr6okljA1rImen',
					funding: 'credit',
					last4: '4242',
					metadata: {},
					name: 'Aleksander Kwiatkowski',
					tokenization_method: null
				},
				source_transfer: null,
				statement_descriptor: null,
				statement_descriptor_suffix: null,
				status: 'succeeded',
				transfer_data: null,
				transfer_group: null
			}
	}
};


module.exports = stripe;
module.exports.Stripe = Stripe;