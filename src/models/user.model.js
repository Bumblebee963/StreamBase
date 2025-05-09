import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
// ye bearer token hai matlab jispeye hai usko data bhej sakte
import bcrypt from 'bcrypt';
const userSchema= new Schema(
    {
        username :{
            type : String,
            unique : true,
            required : true,
            lowercase : true,
            trim : true,
            index : true
            //enables searching field that is makes userschema searchable in database
    
        },
        email : {
            type : String,
            unique : true,
            required : true,
            lowercase : true,
            trim : true,
        },
        fullName : {
            type : String,
            required : true,
            trim : true,
            index : true
        },
        avatar : {
            type : String, //Cloudinary url
            required : true,
        },
        coverImage : {
            type : String, //Cloudinary url
        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Video",
            }
        ],
        password :{
            type : String,
            // but why in string
            required : [true,'Password is required']
        },
        refreshToken : {
            type : String
            // ye kya hai bc
        }
    },
    {
        timestamps : true
    }
)

// pre hook mein arrow function se bhasad ho jayegi kyunki usko this nhi aata aur hume context dene padega to kahan se denge
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password= await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken= async function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken= async function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        })
}
export const User=mongoose.model("User",userSchema)