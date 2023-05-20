const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken')
require('dotenv').config();

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


const login = async (req, res) => {
     try{

        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                sucess: false, 
                message: "email or password field cannot be null"
            })
        }

        const user = await User.findOne({email});

        if(!user){
            return res.status(401).json({
                sucess: false,
                message: "email address does not exist please sign up and then come back"
            })
        }

        //verify passsword and generate jwt token
        if(await bcrypt.compare(password, user.password)){

            const payload = {
                email: user.email,
                id: user._id,
                role: user.role,
            }
            // password matched
            let token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "2h"});
            // return res.status(200).json({
            //     token: token,
            //     message: "logged in sucessfully"
            // });
            user.token = token
            user.password = undefined

            const options = {
                expires: new Date( Date.now() + 3*24*60*60*1000),
                httpOnly: true
          
            }

            return  res.cookie("token", token, options).status(200).json({
                sucess: true,
                token,
                user, 
                message: "user logged in sucessfully!"
            })
      
        }
        else{
            //password do not match 
            return res.status(403).json({
                sucess: false,
                message: "incorrect password"
            })
        }
     }
     catch(error){

        console.log(err);
        return res.status(500).json({
            sucess: false,
            message: "Login failed due to some unexpected reason"
        })
     }
}

module.exports = {signUp, login};