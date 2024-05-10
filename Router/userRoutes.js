const router = require('express').Router();
const user = require('../Model/user');
const Crypto = require('crypto-js');
const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')
const sendEmail = require('../utils/email')
const crypto = require('crypto');




//register
router.post('/post', async (req, res) => {
    try {
        const newUser = new user({
            email: req.body.email,
            name: req.body.name,
            role: req.body.role,
            password: Crypto.AES.encrypt(req.body.password, process.env.Crypto_js).toString()
        });
        console.log(req.body);
        const savedUser = await newUser.save();
        res.status(200).json({
            success: true,
            savedUser
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            error: error.message
        });
    }
});

//get all user
router.get('/get', async (req, res) => {
    const allUser = await user.find()
    res.status(200).json({
        success: true,
        count: allUser.length,
        allUser
    })
})

//get one user
router.get('/get/:id', async (req, res) => {
    const getOneUser = await user.findById(req.params.id);
    if (!getOneUser) {
        return res.status(404).json({
            success: false,
            message: "user not found!"
        })
    }
    return res.status(200).json({
        succ: true,
        getOneUser
    })
})


//update user
router.put('/update/:id', async (req, res) => {
    let User = await user.findById(req.params.id);
    if (!User) {
        return res.status(404).json({
            success: false,
            message: "user not found!"
        })
    }
    await user.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    })
    res.status(200).json({
        success: true,
        User
    })
})


//delete user
router.delete('/delete/:id', async (req, res) => {
    try {
        let User = await user.findById(req.params.id);
        if (!User) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            });
        }
        await user.findByIdAndDelete(req.params.id);
        return res.status(200).json({
            success: true,
            message: "User deletion successful!"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


//login
router.post('/login', async (req, res) => {
    console.log(' login', req.body);

    try {
        const DBdata = await user.findOne({ email: req.body.email })
        !DBdata && res.status(401).json({ response: 'please check your Email' })

        console.log('Backend Data', DBdata);


        const hashedPassword = Crypto.AES.decrypt(DBdata.password, process.env.Crypto_js)
        console.log('hashed password is', hashedPassword);


        const originalPassword = hashedPassword.toString(Crypto.enc.Utf8)
        console.log('Original password is', originalPassword);
        originalPassword != req.body.password && res.status(401).json({ response: "password and email doesnt match" })


        const accessToken = Jwt.sign({
            id: DBdata._id
        }, process.env.Jwt_sec,
            { expiresIn: '5d' })

        console.log("****", accessToken);
        const { password, ...others } = DBdata._doc
        res.status(200).json({ success: true, accessToken })

    } catch (err) {
        res.status(400).json({
            err: err.message
        })
    }


})

module.exports = router;



//forget password
router.post('/forgetpass', async (req, res) => {
    const User = await user.findOne({ email: req.body.email })
    if (!User) {
        return res.status(404).json({
            success: false,
            message: "user not found"
        })
    }

    //generete token
    const resetToken = User.createRestPassword();

    await User.save({ validateBeforeSave: false });

    //send token back to user
    const resetUrl = `${req.protocol}://${req.get('host')}/user/reset/${resetToken}`;
    const message = `we have recieved a password reset request.please use the below link to reset your password\n\n${resetUrl}\n\n This reset password link is only valid for 10 mins`

    try {
        await sendEmail({
            email: User.email,
            subject: 'password change request recieved',
            message: message
        })

        res.status(200).json({
            success: true,
            message: "reset link sended to your email "
        })

    } catch (error) {
        User.resetPasswordToken = undefined;
        User.resetPasswordTokenExpire = undefined;
        User.save({ validateBeforeSave: false });

        return res.status(500).json('please try again later')
    }

})


//reset password
router.patch('/resetpass/:token', async (req, res) => {
    try {
        // 1. user exists with the given token and token has not expired 
        const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const User = await user.findOne({ resetPasswordToken: token, resetPasswordTokenExpire: { $gt: Date.now() } })

        if (!User) {
            return res.status(400).json({
                success: false,
                message: "Token is invalid or expired"
            })
        }

        // 2. resetting password
        User.password = req.body.password;
        User.confirmPassword = req.body.confirmPassword;
        // After resetting the password, we don't need the resetPasswordToken & resetPasswordTokenExpire fields in mongodb
        User.resetPasswordToken = undefined;
        User.resetPasswordTokenExpire = undefined
        User.passordChangedAt = Date.now();

        await User.save();

        // 3. Generate access token and send it back to the client
        const accessToken = Jwt.sign({ id: User._id }, process.env.Jwt_sec, { expiresIn: '5d' });

        res.status(200).json({
            success: true,
            token: accessToken
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});




