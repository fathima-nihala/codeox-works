const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            port: 465,
            auth: {
                user: "nihalafathima547@gmail.com",
                pass: "eqejalalcxrlfzok",
            }
        })

        const reciever = {
            from: "nihalafathima547@gmail.com",
            to: options.email,
            subject: options.subject,
            text: options.message
        }

        const info = await transporter.sendMail(reciever);
        console.log('Email sent:', info.response);
        return info;
    } catch (err) {
        console.log("Error saving user:", err);
        return res.status(500).json({error:"Error sendimg OTP mail"})
    }


};

module.exports = sendEmail;
