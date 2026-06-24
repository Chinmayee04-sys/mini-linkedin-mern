const express=require("express")
const router=express.Router();
const{
    createPost,getPosts,likePost,commentPost,getFeedPosts,getUserPosts,updatePost
}=require("../controllers/postController")
const protect=require("../middleware/authMiddleware");
router.post("/",protect,createPost)
router.get("/",getPosts)
router.get("/feed",protect,getFeedPosts)
router.get("/user/:userId",getUserPosts)
router.put("/like/:id",protect,likePost)
router.put("/comment/:id",protect,commentPost)
router.put("/:id",protect,updatePost)
module.exports=router;