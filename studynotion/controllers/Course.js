const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const {uploadImageToCloudinary} = require('../utils/imageUploader');
require('dotenv').process();

//create handler function
exports.createCourse = async(req, res) => {
    try{
        //fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation

        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor details: ", instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success: false,
                message: "instructor not found",
            });
        }

        //check given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success: false,
                message: "Tag Details not found",
            });
        }

        //upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create new course

        const newCourse = await Course.create({
            courseName, 
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url, 
        });

        //add new course to schema
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            {
                new: true,
            }
        );
         //return res
        return res.status(200).json({
            success:true,
            message: "Course created successfully",
            data: newCourse,
        });


    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        });
    }
};

//get all courses
exports.showAllCourses = async(req, res) => {
    try{
        const allCourses = await Course.find({}, {courseName: true,
                                                price: true,
                                                thumbnail: true,
                                                instructor: true,
                                                ratingAndReviews: true,
                                                studentsEnrolled: true,})
                                                .populate('instructor')
                                                .exec();
        res.status(200).json({
            success: true,
            message: "All Courses returned successfully",
            data: allCourses,
        });

    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "cannot fetch all course data",
            error: error.message,
        });
    }
};