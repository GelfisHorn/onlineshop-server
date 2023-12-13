import nodemailer from 'nodemailer';
import ejs from 'ejs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

function getTransporter() {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    return transporter;
}

async function sendEmail({ options, content }) {
    const { to, subject } = options;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    try {
        const html = await ejs.renderFile(__dirname + '/views/email.ejs', { content });
        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to,
            subject,
            html,
        };
        
        const transporter = getTransporter();
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}

export {
    sendEmail
}