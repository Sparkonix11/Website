const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

exports.createSubSection = async (req, res) => {
    try {
        //fetch data
        const {sectionId, title, timeDuration, description} = req.body;

        //extract file/video

        const video = req.files.videoFile;
        
        //validation

        if(!title || !sectionId || !timeDuration || !description){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        //upload video

        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        //create a sub section

        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl:  uploadDetails.secure_url,
        });

        //update section with sub section ID

        const updatedSection = await Section.findByIdAndUpdate({_id: sectionId},
                                                                {
                                                                $push: {
                                                                    subSection: subSectionDetails._id,
                                                                    }   
                                                                },{new: true}).populate("subSection");

        //return res
        return res.status(200).json({
            success: true,
            message: "SubSection created successfully",
            data: updatedSection
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to create subsection. PLease try again",
            error: error.message,
        });
    }
};
