const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//SendOTP

exports.sendOTP = async (req, res) => {
    try {
        //fetching email
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent){
            return res.status(401).json({
                success: false,
                message: "User already existed"

            })
        }

        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })
        console.log("OTP generated: ", otp);
        
        //check unique otp or not
        const result = await OTP.findOne({otp: otp});

        with(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayLoad = {email, otp};

        //create an entry in DB for OTP
        const otpBody = await OTP.create(otpPayLoad);
        console.log(otpBody);
        
        //return response
        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            otp,
        })



    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

//SignUp
exports.signUp = async (req, res) => {
    try{
        //data fetch
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validate data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
            return res.status(403).json({
                success: false,
                message: "All Fields are necessary"
            });
        }

        //matching password

        if(password !== confirmPassword){
            return res.status(400).json({
                success: true,
                message: "password and Confirm password doesn't match"
            });
        }

        //check user exist already

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User is already existed"
            });
        }

        //find most recent OTP for user

        const recentOtp = await OTP.find({email}).sort({createdAt: -1}).limit(1);
        console.log(recentOtp)

        //validate OTP
        if(recentOtp.length == 0){
            return res.status(400).json({
                success: false,
                message: "OTP not found"
            })
        } else if (otp !== recentOtp){
            return res.status(400).json({
                success: false,
                message: "Wrong OTP"
            })
        }

        //Hash password

        const hashedPassword = await bcrypt.hash(password, 10);

        //create entry in DB

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additonalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,

        });

        //return res

        return res.status(200).json({
            success: true,
            message: "User created successfully",
            user,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again"
        });

    }
};


//Login

exports.login = async (req, res) => {
    try{
        //get data from req body
        const {email, password} = req.body;
        //validating data
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        //check user if exist or not

        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success: false,
                message: "User is not registered, please sign up"
            });
        }

        //generate JWT, after password matching

        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"2h",
            });
            user.token= token;
            user.password = undefined;

            //create cookie and send res

            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully"
            })
        }
        else{
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "can't login. please try again later"
        });

    }
};

//change password

exports.changePassword = async (req, res) => {
    //fetch data from body


    //get oldPassword, newPassword, confirmNewPassword


    //validation


    //update pwd in DB


    //send mail - password updated


    //return response
}