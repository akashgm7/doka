const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Log the link to the console for development testing
    console.log('--- EMAIL SIMULATION ---');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('Message:', options.message);
    console.log('------------------------');

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const message = {
            from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const info = await transporter.sendMail(message);
        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Email Sending Error:', error.message);
        // If we're in development, we don't want to break the flow
        if (process.env.NODE_ENV === 'development') {
            console.log('Simulation Mode: Email delivery failed but process continuing.');
            return true;
        }
        return false;
    }
};

module.exports = sendEmail;
