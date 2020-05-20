const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'awers3@gmail.com',
		subject: 'Thanks for joining in!',
		text: `Welcome in our shop, ${name}. To complete registration, please enter the following link: `
	});
};

module.exports = {
    sendWelcomeEmail
};