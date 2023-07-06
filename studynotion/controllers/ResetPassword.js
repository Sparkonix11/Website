const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");


//resetPasswordToken

exports.resetPasswordToken = async (req, res) => {
    try{
        //fetch email from req

        const email = req.body.email;

        //validation

        const user = await User.findOne({email: email});
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Your Email is not registered with us",
            });
        }

        //token generation

        const token = crypto.randomUUID();

        //update User with token

        const updatedDetails = await User.findOneAndUpdate({email: email},
                                                            {
                                                                token: token,
                                                                resetPasswordExpires: Date.now() + 5*60*1000,
                                                            },
                                                            {new:true});

        //Link generation

        const url = `http://localhost:3000/update-password/${token}`;

        //sending mail to reset password

        await mailSender(email, "Password Reset Link", `Password Reset Link: ${url}`);


        //sending res

        return res.status(200).json({
            success: true,
            message: "Email sent successfully. Please check your inbox"
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong with resetting your Password. Please try again"
        });
    }
};


//resetPassword

exports.resetPassword = async(req, res) => {
    try{
        //data fetch

        const {password, confirmPassword, token} = req.body;

        //validation

        if(password !== confirmPassword){
            return res.json({
                success: false,
                message: "Password is not matching",
            });
        }

        //get user details from db using token

        const userDetails = await User.findOne({token: token});

        //invalid token

        if(!userDetails) {
            return res.json({
                success: false,
                message: "Invalid Token",
            });
        }


        //token validation

        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.json({
                success: false,
                message: "Token is expired. Please try again",
            });
        }

        //hash pwd

        const hashedPassword = await bcrypt.hash(password, 10);

        //password update

        await User.findOneAndUpdate({token: token},
                                    {password: hashedPassword},
                                    {new: true},);

        //return res

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "something went wrong while sending reset mail"
        });
    }
};