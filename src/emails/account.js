const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = async (email, name, linkPromise) => {
	const authLink = await linkPromise;

	sgMail.send({
		to: email,
		from: 'awers3@gmail.com',
		subject: 'Thanks for joining in!',
		text: `Welcome in our shop, ${name}. To complete registration, please enter the following link: ${process.env.HOST_URL}/user/verify/${authLink}`
	});
};

module.exports = {
    sendWelcomeEmail
};