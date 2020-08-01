const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = async (email, name, linkPromise) => {
	const authLink = await linkPromise;

	await sgMail.send({
		to: email,
		from: process.env.SENDGRID_EMAIL,
		subject: 'Thanks for joining in!',
		text: `Welcome in our shop, ${name}. To complete registration, please enter the following link: ${process.env.FRONTEND_URL}/verify_email/${authLink}`
	});
};


const sendPurchaseSuccessEmail = async ({email, name, products, invoiceLink, totalPrice}) => {
	await sgMail.send({
		to: email,
		from: process.env.SENDGRID_EMAIL,
		subject: 'Thank you for your purchase in Hexashop',
		text: `
		Hello ${name}!
		
		We're very grateful for your recent purchase in our shop, here's link to your receipt: ${invoiceLink} .
		
		The products you've bought are:
		 
		${products.map(product => `${product.name} - ${product.price}$ x ${product.quantity} = ${product.price * product.quantity}$\n\n`)}
		_______________
		TOTAL: ${totalPrice/100}$
		
		Thank you for your trust. YOur order will be shipped within the next working day.
		`
	})
}

module.exports = {
    sendWelcomeEmail,
		sendPurchaseSuccessEmail
};