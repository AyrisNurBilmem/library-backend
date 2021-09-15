const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const internal = require("stream");

const LibraryUserSchema = new mongoose.Schema({
    username:{
        type:String,
        required: [true, "Please enter a username"],
    },
    email:{
        type:String,
        required:[true, "Please enter an email"],
        unique:true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    password:{
        type:String,
        required:[true, "Please enter a password"],
        minlength:6,
        select:false
    },
    address:{
        type:String,
    },
    booksOwned:{
        yourbooks:[],
        addDate:[],
        returnDate:[],
        overdueFine:[Number],
    },
    checkedOutBooks:[],
    resetPasswordToken: String,
    resetPasswordExpired:Date

})

LibraryUserSchema.pre("save", async function(next){
    //if modified ->  pass
    if(!this.isModified("password")){
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

//otherwise -> hash

LibraryUserSchema.methods.getSignedToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE})
}

LibraryUserSchema.methods.matchPasswords = async function(password){
    return await bcrypt.compare(password, this.password);
}

LibraryUserSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpired = Date.now() + 10 * (60 * 1000); //10 mins
    console.log(resetToken);
    return resetToken;
}

const LibraryUser = mongoose.model("LibraryUser",LibraryUserSchema);

module.exports = LibraryUser;



//reset password token

/*
getresetpasswordtoken
    1. resetToken=123
    2. resetpasswordtoken = hash(resetToken) = abc
    3. return 123

forgotpassword
    1. url=123

resetpassword
    1. new resetpasswordtoken = url(123) = abc
    2. old resetpassswordtoken = abc   / new resetpasswordtoken = abc

** change the password **




*/ 

