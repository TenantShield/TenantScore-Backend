const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
/**
 * Sends an email with login credentials.
 * @param {string} email - The recipient's email.
 * @param {string} tempPassword - The temporary password.
 */
const sendLoginCredentials = async (email) => {
    try {
        await transporter.sendMail({
            from: `"TenantScore Admin" <${process.env.EMAIL_ADMIN}>`,
            to: email,
            subject: "Your TenantScore Account has been created",
            text: `Your account has been created.\nEmail: ${email}\nPlease log in and create your password.`,
            html: `<p>Your account has been created.</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <p>Please log in and create your password.</p>`
        });
        console.log(`Login credentials sent to ${email}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendLoginCredentials };