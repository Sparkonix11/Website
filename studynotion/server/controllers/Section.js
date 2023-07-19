const Section = require('../models/Section');
const Course  = require('../models/Course');

exports.createSection = async (req, res) => {
    try{
        //data fetch
        const {sectionName, courseId} = req.body;

        //data validation

        if(!sectionName || !courseId){
            return res.status(400).json({
                success: false,
                message: "Missing properties",
            });
        }

        //create section

        const newSection = await Section.create({sectionName});

        //update coures with section ObjectID

        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                                            courseId,
                                                            {
                                                                $push: {
                                                                    courseContent: newSection._id,
                                                                }
                                                            },
                                                            {new: true},
                                                            ).populate({
                                                                path: "courseContent",
                                                                populate: {
                                                                    path: "subSection",
                                                                },
                                                            })
                                                            .exec();

        // return res

        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourseDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Unable to create section.PLease try again",
            error: error.message,
        });
    }
};

exports.updateSection = async (req, res) => {
    try{
        //data inout

        const {sectionName, sectionId} = req.body;

        //data validation

        if(!sectionName || !sectionId){
            return res.status(400).json({
                success: false,
                message: "Missing properties",
            });
        }

        //update data

        const section = await Section.findByIdAndUpdate(sectionId,{sectionName}, {new: true});

        //return res
        return res.status(200).json({
            success: true,
            message: section,
        });
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Unable to update section. PLease try again",
            error: error.message,
        });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        //get ID

        const {sectionId} = req.params;

        //delete section

        await Section.findByIdAndDelete(sectionId);


        //return res
        return res.status(200).json({
            success: true,
            message: "Section Deleted successfully",
            updatedCourseDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to delete section. PLease try again",
            error: error.message,
        });

    }
};