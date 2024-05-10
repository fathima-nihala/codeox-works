const mongoose = require('mongoose')
const MailUser = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique:false

    },
    otp: {
        type: String,
        required: true,
    },
    otpExpiration: {
        type: Date,
        required: true,
    },
})
module.exports = mongoose.model("Mailer", MailUser)