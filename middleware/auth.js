const jwt = require("jsonwebtoken")
const LibraryUser = require("../models/LibraryUser")

exports.protect = async (req, res, next) =>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        //get token
        token = req.headers.authorization.split(" ")[1];
    }
    
    if(!token){
        return next(  res.status(401).json({
            success: false,
            error: "Not auhtorized to access this route 1"
        }))
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await LibraryUser.findById(decoded.id);

        if(!user){
            return next(res.status(400).json({
                success:false,
                error:"No user found with this id"
            }))
            
        }

        req.user = user;
        next();

    } catch (error) {
        return next(res.status(401).json({
            success:false,
            error:"Not authorized to access this route 2"
        }))
    }
}