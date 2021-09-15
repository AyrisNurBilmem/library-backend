const LibraryUser = require("../models/LibraryUser")
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { compare } = require("bcryptjs");

exports.register = async (req, res, next) => {
    const {username, email, password, address} = req.body;
    
    try {
        const user = await LibraryUser.create({
            username,
            email,
            password,
            address
        })

        sendToken(user, 201,res);
        
    } catch (error) {
        res.status(500).json({
            success:false,
            error:error.message
        })
    }
}

exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password){
        res.status(400).json({
            success: false,
            error:"Please enter a valid email and password"
        })
    }

    try {
        const user = await LibraryUser.findOne({email}).select("+password");

        if(!user){
            res.status(401).json({
                succes: false,
                error: "Invalid Credentials"
            })

        }

        //check if the passwordds match
        const isMatched = await user.matchPasswords(password);

        if(!isMatched){
            res.status(401).json({
                success: false,
                error: "Invalid Credentials"
            })
        }

        sendToken(user, 200, res);
        userEmail = user.email;
        
        if(user.booksOwned === null){
            console.log("No books yet");
        }else{
            booklist = user.booksOwned.yourbooks;
            addDateList = user.booksOwned.addDate;
            returnDateList = user.booksOwned.returnDate;
            overdueList = user.booksOwned.overdueFine;
        }
    


        

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })  
    }
}

exports.forgotpassword =  async (req, res, next) => {
    const {email} = req.body;

    try {
        const user = await LibraryUser.findOne({email});

        if(!user){
            return next(res.status(404).json({
                success:false,
                error:"Email could not be sent 1"
            }));
        }

        const resetToken = user.getResetPasswordToken();
        
        await user.save();

        const resetURL = `http://localhost:3000/resetpassword/${resetToken}`
        const message = `
            <h1>You have requested to reset your password</h1>
            <p>Please click on the link above to reset your password</p>
            <a href = ${resetURL} clicktracking=off>${resetURL}</a>
        `
       try {
           await sendEmail({
               to:user.email,
               subject:"Password Reset",
               text:message
           });

           res.status(200).json({
               success:true,
               data:"Email has been sent"
           });

       } catch (error) {
           user.resetPasswordToken = undefined;
           user.resetPasswordExpired = undefined;

           await user.save();

           return next(res.status(500).json({
               success: false,
               error:"Email could not be sent 2"
           }));
       }
    } catch (error) {
        return next(error);
    }
}

exports.resetpassword =  async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");
    
    try {
        const user = await LibraryUser.findOne({
            resetPasswordToken,
            resetPasswordExpired: {$gt: Date.now()}
        });

        if(!user){
            return next(res.status(400).json({
                success:false,
                error:"Invalid Reset Token"
            }));
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpired=undefined;

        await user.save();

        res.status(201).json({
            success:true,
            data:"Password updated successfully! ",
            token:user.getSignedToken()
        })

    } catch (error) {
        return next(error);
    }
}



exports.getbooks = async (req, res, next) => {
    res.send(booklist);
    next();
}

exports.getborrowdate = async (req, res, next) => {
    res.send(addDateList);
    next();
}

exports.getreturndate = async (req, res, next) => {
    res.send(returnDateList);
    next();
}

exports.getoverduefine = async (req, res,next) =>{
    res.send(overdue);
    next();
}




exports.viewbooks = async (req, res, next) => {
    const {book, date, returnDate,overdue} = req.body;
    booklist.push(book);
    addDateList.push(date);
    returnDateList.push(returnDate);
    overdueList.push(overdue);
    


    const user = await LibraryUser.findOne({email: userEmail});
    LibraryUser.findOne(userEmail, function(){
        user.booksOwned.yourbooks = booklist;
        user.booksOwned.addDate = addDateList;
        user.booksOwned.returnDate = returnDateList;
        user.booksOwned.overdueFine = overdueList;
        
    })

    user.save();

   


}

exports.checkoutbooks = async (req, res, next) =>{
    const {book} = req.body;
    const user = await LibraryUser.findOne({email:userEmail});
    
    LibraryUser.findOne({email:userEmail}, function(){
        booklist = user.booksOwned.yourbooks;
        addDateList = user.booksOwned.addDate;
        returnDateList = user.booksOwned.returnDate;
        overdueList = user.booksOwned.overdueFine;
    })


    user.checkedOutBooks.push(book);
    user.booksOwned.addDate = user.booksOwned.addDate.filter((item, index) => index !== booklist.indexOf(book));
    user.booksOwned.returnDate = user.booksOwned.returnDate.filter((item, index) => index !== booklist.indexOf(book));
    user.booksOwned.overdueFine = user.booksOwned.overdueFine.filter((item,index) => index !== booklist.indexOf(book));
    user.booksOwned.yourbooks = user.booksOwned.yourbooks.filter(id => id !== book);
    
    user.save();

}

exports.history = async (req, res, next) =>{
    const user = await LibraryUser.findOne({email:userEmail});
    LibraryUser.findOne({email:userEmail}, function(){
        res.send(user.checkedOutBooks);
    })
}

const sendToken = (user, statusCode, res) =>{
    const token = user.getSignedToken();
    res.status(statusCode).json({
        success:true,
        token
    })
}


let booklist =[];
let addDateList = [];
let returnDateList = [];
let overdueList = [];
let userEmail = "";
