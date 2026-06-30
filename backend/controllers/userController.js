const User=require("../models/User");
const bcryptjs=require("bcryptjs");
const generateToken=require("../utils/generateToken");
const searchUsers=async(req,res)=>{
  try{
    const { q } = req.query;
    if(!q) return res.json([]);
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    }).select("name email profilePic");
    res.json(users);
  } catch(err){
    res.status(500).json({message: err.message})
  }
}

const getUsers=async(req,res)=>{
    try{
        const users=await User.find();
        return res.json(users);
    }
    catch(err){
        return res.status(500).json({
            message:err.message
        })
    }
}
const registerUser=async(req,res)=>{
    try{
        const {name,email,password}=req.body;
        //check if user exists
        const userExists= await User.findOne({email})
        if(userExists){
            return res.status(400).json({
                message:"User already exists"
            })
        }
        // generate salt for hashing the password
        const salt=await bcryptjs.genSalt(10);
        //hash the password using the generated salt
        const hashedPassword=await bcryptjs.hash(password,salt);

        // create a new user with the provided name, email, and hashed password
        const user=await User.create({
            name,email,password:hashedPassword
        })
        // we give a status code of 201 to indicate that a new resource (user) has been successfully created and we can also return the created user object in the response if needed
        return res.status(201).json({
            _id: user.id,
            name:user.name,
            email:user.email,
            token:generateToken(user._id),
            message:"User registered successfully"

        })

    }
    catch(err){
        return res.status(500).json({
            message:err.message
        })
    }
}

const loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "User not found"
      });
    }
    console.log(user);
    console.log(user.password);
    console.log(password);
    const isMatch = await bcryptjs.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


const getProfile=async(req,res)=>{
  try{
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("followers", "name profilePic")
      .populate("following", "name profilePic");
    res.json(user)
  } catch(err){
    res.status(500).json({message: err.message})
  }
}

const updateProfile=async(req,res)=>{
  try{
    const user =await User.findById(req.user._id);
    if(!user){
      return res.status(404).json({
        message:"user not found"
      })
    }
    user.bio=req.body.bio !== undefined ? req.body.bio : user.bio
    user.skills=req.body.skills || user.skills
    user.profilePic=req.body.profilePic || user.profilePic
    if(req.body.experience !== undefined) user.experience = req.body.experience
    if(req.body.education !== undefined) user.education = req.body.education
    const updatedUser = await user.save()
    res.json(updatedUser)
    
  }
  catch(err){
    res.status(500).json({
      message:err.message
    })
  }
}

const suggestedUsers=async(req,res)=>{
  try{
    const currentUser=await User.findById(req.user._id);
    const users=await User.find({
      _id:{$ne:req.user._id,$nin:currentUser.following}
    }).select("name profilePic skills").limit(5);
    res.json(users);
  } catch(err){
    res.status(500).json({message:err.message});
  }
}

const followUser=async(req,res)=>{
  try{
    const userToFollow=await User.findById(req.params.id);
    const currentUser=await User.findById(req.user._id);
    if(!userToFollow){
      return res.status(404).json({
        message:"User Not Found"
      })
    }
    const alreadyFollowing =
      currentUser.following.includes(
        userToFollow._id
      );

    if (alreadyFollowing) {

      // Unfollow
      currentUser.following =
        currentUser.following.filter(

          (id) =>
            id.toString() !==
            userToFollow._id.toString()

        );

      userToFollow.followers =
        userToFollow.followers.filter(

          (id) =>
            id.toString() !==
            currentUser._id.toString()

        );

    } else {

      // Follow
      currentUser.following.push(
        userToFollow._id
      );

      userToFollow.followers.push(
        currentUser._id
      );

    }

    await currentUser.save();

    await userToFollow.save();

    res.json({
      message: alreadyFollowing
        ? "User unfollowed"
        : "User followed"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};


const getUserById=async(req,res)=>{
  try{
    const user=await User.findById(req.params.id)
      .select("-password")
      .populate("followers","name profilePic")
      .populate("following","name profilePic");
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    res.json(user)
  } catch(err){
    res.status(500).json({message:err.message})
  }
}

const forgotPassword=async(req,res)=>{
  try{
    const user=await User.findOne({email:req.body.email});
    if(!user){
      return res.status(404).json({message:"No account with that email"});
    }
    const token=user.generateResetToken();
    await user.save();

    const resetUrl=`${process.env.CLIENT_URL}/reset-password/${token}`;

    res.json({
      message:"Password reset link generated",
      resetUrl
    });
  } catch(err){
    res.status(500).json({message:err.message});
  }
};

const resetPassword=async(req,res)=>{
  try{
    const user=await User.findOne({
      resetPasswordToken:req.params.token,
      resetPasswordExpires:{$gt:Date.now()}
    });
    if(!user){
      return res.status(400).json({message:"Invalid or expired token"});
    }
    const salt=await bcryptjs.genSalt(10);
    user.password=await bcryptjs.hash(req.body.password,salt);
    user.resetPasswordToken=undefined;
    user.resetPasswordExpires=undefined;
    await user.save();
    res.json({message:"Password reset successful"});
  } catch(err){
    res.status(500).json({message:err.message});
  }
};

module.exports={
    getUsers,
    registerUser,loginUser,getProfile,updateProfile,followUser,searchUsers,getUserById,
    forgotPassword,resetPassword,suggestedUsers
}
