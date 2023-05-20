const bcrypt = require('bcrypt');
const User = require('../models/User');


//sign up route handler
const signUp = async (req, res) => {

    try {

        // get details from the body 
        const { name, email, password, roll } = req.body;

        //check iif user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(400).json({
                sucess: false,
                message: "this email salready exits"
            })
        }

        //encrypt the password that is given by user (secure password)
        let hashedPassword
        try {
            hashedPassword = await bcrypt.hash(password, 10)
        }
        catch (err) {
            res.status(500).json({
                sucess: false,
                message: "error in hashing password"
            });
        }

        //crate enrtry {
        const user = await User.create({
            name, email, password: hashedPassword, roll
        });

        return res.status(200).json({
            sucess: true, 
            message: "user created sucessfully!",
        })

    }

    catch (err) {
        res.status(500).json({
            sucess: false,
            message: "there is some problem in the sign up  api please try again later"
        })
        console.error(err);

    }

}

module.exports = signUp;