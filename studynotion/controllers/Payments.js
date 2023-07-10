const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');
const { default: mongoose } = require("mongoose");

exports.capturePayment = async (req, res) => {
    //get courseId and UserId

    const {course_id} = req.body;
    const userId = req.user.id;

    //validation
    //valid CourseID
    if(!course_id){
        return res.json({
            success: false,
            message: "Please provide valid course id",
        });
    };

    
    //valid courseDetails
    let course;
    try {
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success: false,
                message: "could not find the course",
            });
        }
         //user already pay for same course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.stundentsEnrolled.includes(uid)){
            return res.status(400).json({
                success:false,
             message: "Student is already enrolled",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }

   

    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount * 100,
        currency: currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            courseId: course_id,
            userId,
        }
    };

    try {
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

         //return response
         return res.status(200).json({
            success: true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
         });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "could not inititate order",
            error: error.message,
        });
    }
};

//verify signature of razorpay and server
exports.verifySignature = async (req, res) => {
    const webhookSecret = "123";
    const signature = req.headers["x-razorpay-signature"]; 
    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest) {
        console.log("Payment is Authorised");
        const {courseId, userId} = req.body.payload.payment.entity.notes;
        try {
            const enrolledCourse = await Course.findByIdAndUpdate(
                                                                {_id: courseId},
                                                                {$push: {stundentsEnrolled: userId}},
                                                                {new: true},
            );
            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message: "Course not found",
                    error: error.message,
                });
            }
            console.log(enrolledCourse);

            const enrolledStudent = await User.findByIdAndUpdate(
                                                            {_id: userId},
                                                            {$push: {courses: courseId}},
                                                            {new: true},
            );
            console.log(enrolledStudent);

            //confirmation mail
            const emailResponse = await mailSender(enrolledStudent.email,
                                                    "Course enrollment Successful",
                                                    "course successfully enrollment");
            console.log(emailResponse);
            return res.status(200).json({
                success: true,
                message: "Signature verified and course added"
             });

        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    else{
        return res.status(400).json({
            success: false,
            message: "invalid Signature",
        });
    }

};