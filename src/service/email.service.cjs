// configuro el servicio de email

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'emybr82ar@gmail.com',
        pass: 'jdzfjymqbqconarm'
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
