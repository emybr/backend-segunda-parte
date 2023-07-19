// configuro el servicio de email

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});

exports.sendEmail = async (email, subject, text) => {
    try {
        const mailOptions = {
            from: 'tu_correo',
            to: email,
            subject,
            text
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
    }
};
