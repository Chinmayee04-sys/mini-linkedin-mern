const crypto=require("crypto");
const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    bio:{
        type:String,
        default:""
    },
    skills:{
        type:[String],
        default:[]
    },
    profilePic:{
        type:String,
        default:""
    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    resetPasswordToken:{type:String},
    resetPasswordExpires:{type:Date}
},
    {
        timestamps:true
    }
);

userSchema.methods.generateResetToken=function(){
  const token=crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken=token;
  this.resetPasswordExpires=Date.now()+3600000;
  return token;
};

module.exports=mongoose.model("User",userSchema);