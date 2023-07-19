const Profile = require("../models/Profile");
const User = require("../models/Profile");

exports.updateProfile = async (req, res) => {
    try {
        //fetch data
        const {dateOfBirth="", about = "", contactNumber, gender} = req.body;

        //getUSerId

        const id = req.user.id;

        //validation

        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success: false,
                message: "Missing properties. All field are required",
            });
        }

        //find Profile

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update Profile

        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        //return response

        return res.status(200).json({
            success: true,
            message: "Profile Updated successfully",
            profileDetails,
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update section. PLease try again",
            error: error.message,
        });
        
    }
};

exports.deleteAccount = async(req, res) => {
    try {
        //get id

        const id = req.user.id;
		const user = await User.findById({ _id: id });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}
		// Delete Assosiated Profile with the User
		await Profile.findByIdAndDelete({ _id: user.userDetails });
		// TODO: Unenroll User From All the Enrolled Courses
		// Now Delete User
		await user.findByIdAndDelete({ _id: id });

        //return res

        return res.status(200).json({
            success: true,
            message: "User delted successfully",
            updatedSection
        });


        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to delete Profile. PLease try again",
            error: error.message,
        });
    }
};

exports.getAllUserDetails = async (req, res) => {
    try {
        //get id
        const id = req.user.id;

        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        //return res
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            data: userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to delete Profile. PLease try again",
            error: error.message,
        });
    }
};
exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};