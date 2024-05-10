const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name.']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email.'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter valid email address']

    },
    password: {
        type: String,
        required: [true, 'Please enter a password.'],
        minLength: 6
    },
    role: {
        type: String,
        default: 'user',
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your password.']
    },  
    passordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date


}, { timestamps: true })



// ************imp
//reset password
userSchema.methods.createRestPassword = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
   this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
   this.resetPasswordTokenExpire = Date.now() + 10 * 60 * 1000;
   console.log('reset token:', resetToken,this.resetPasswordToken);
   return resetToken;
}


module.exports = mongoose.model('User', userSchema)