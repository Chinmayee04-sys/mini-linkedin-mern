const Post = require("../models/Post");
const User = require("../models/User");

const createPost = async (req, res) => {

  try {

    const { text, image } = req.body;

    const post = await Post.create({

      user: req.user._id,

      text,

      image

    });

    res.status(201).json(post);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
const getPosts=async(req,res)=>{
  try{
    const posts=await Post.find().populate("user","name profilePic").populate("comments.user","name profilePic").sort({
      createdAt:-1
    })
    res.json(posts)
  }
  catch(err){
    res.status(500).json({
      message:err.message
    })
  }
}
const likePost=async(req,res)=>{
  try{
    const post= await Post.findById(req.params.id)
    if(!post){
      return res.status(404).json({
        message:"Post not found"
      })
    }
    const alreadyLikes=post.likes.includes(req.user._id)
    if(alreadyLikes){
      //for unliking the post
      post.likes = post.likes.filter(

        (id) => id.toString() !== req.user._id.toString()

      );

    }
    else{
      //liking the post
      post.likes.push(req.user._id)
    }
    await post.save()
    res.json(post)
  }
  catch(err){
    return res.status(500).json({
      message:err.message
    })
  }
}

const commentPost=async(req,res)=>{
  console.log("BODY:",req.body);
  try{
    const post=await Post.findById(req.params.id)
    if(!post){
      return res.status(404).json({
        message:"Post not found"
      })
    }
    const newComment= {
       user:req.user._id ,
       text:req.body.text
      }
      console.log("NEW COMMENT =", newComment);
      console.log(req.body);
      console.log(newComment);
      if (!post.comments) {
  post.comments = [];
}
    post.comments.push(newComment)
    await post.save()
    res.json(post)
    console.log(post.comments)
  }catch(err){
    console.log(err)
    return res.status(500).json({
      message:err.message
    })
  }
}
const getFeedPosts = async (req, res) => {

  try {

    const currentUser =
      await User.findById(req.user._id);

    const posts = await Post.find({

      user: {
        $in: currentUser.following
      }

    })

      .populate("user", "name profilePic")

      .populate(
        "comments.user",
        "name profilePic"
      )

      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "name profilePic")
      .populate("comments.user", "name profilePic")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }
    post.text = req.body.text || post.text;
    const updated = await post.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,commentPost,getFeedPosts,getUserPosts,updatePost
};