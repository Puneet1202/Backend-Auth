const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,  // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendEmail(to, subject, html){
 const info = await transporter.sendMail({
     from :`"Auth App" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
    });
    console.log("Message sent: %s", info.messageId);
    return info;
    } 
module.exports = sendEmail;