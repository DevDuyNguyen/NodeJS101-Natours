const User=require("../models/userModel");
const appError=require("../utils/appError");
const email=require("../utils/email");
const commonFunc=require("../utils/commonFunc");
const APIFeatures=require("../utils/APIFeatures");
const handlerFactory=require("./handlerFactory");

module.exports.getAllUsers=async (req, res, next)=>{
    try {
        let query=User.find();
        let features=await new APIFeatures(query, req.query, User)
                    .filter()
                    .limitFields();
        await features.pagination();
        let users=await query;
        res.status(200).json({
            status:"success",
            data:users
        })

    } catch (error) {
        next(error)
    }
}

module.exports.createNewUser=async (req, res, next)=>{
    try {
        req.body.__id=undefined;
        let freshUser=await User.create(req.body);
        res.status(201).json({
            status:"success",
            data:freshUser
        });
    } catch (error) {
        next(error)
    }

}

module.exports.getUserByID=handlerFactory.findOne(User);

module.exports.deleteUserByID=handlerFactory.deleteOne(User);

module.exports.updateUserByID=handlerFactory.
updateOne(User, null, ["password", "passwordChangeAt", "resetToken", "resetTokenExpiresAt"])

module.exports.forgetPassword=async(req, res, next)=>{
    try {
        let user=await User.findOne({email:req.body.email});
        if(!user)
            return next(new appError("This email doesn't exist", 404, "fail"))
        let resetToken=user.createPasswordResetToken();
        await user.updateOne({$set:{
            resetToken:user.resetToken,
            resetTokenExpiresAt:user.resetTokenExpiresAt
        }});

        let resetLink=`${req.protocol}://${req.host}/api/v1/users/resetPassword/${resetToken}`;

        try {
            await email.sendEMail({
                receiverEmail:req.body.email,
                subject:"Reset link only valid within the next 10 minutes",
                message:`send a PATCH request with your new {password:, passwordConfirm:} to the reset link ${resetLink}`
            })
            res.status(200).json({
                status:"success",
                message:"The reset link is sent"
            })    
        } catch (error) {
            user.resetToken=undefined;//explain
            user.resetTokenExpiresAt=undefined;
            user.updateOne({$set:{
                resetToken:user.resetToken,
                resetTokenExpiresAt:user.resetTokenExpiresAt
            }});
            next(new appError(error.message, 500, "error"));
        }

    } catch (error) {
        next(error);
    }

}

module.exports.updateMe=async (req, res, next)=>{
    try {
        /*user Mongoose Document is retrieved via middleware protect()
        protec() also check if user is authenticated or not
        */

        //deny user from updating password
        if(req.body.password){
            return next(new appError("You cannot update password via this route", 400, "fail"));
        }
        //filter unwanted fields for update
        let fileterUpdate=commonFunc.fileterAllowFields(req.body, "name", "email");
        //[not done: not processing file update yet]

        //update user
        let updatedUser=await User.findOneAndUpdate({_id:req.user.id}, fileterUpdate,{
            runValidators:true,
            new:true
        });
        res.status(200).json({
            status:"success",
            data:updatedUser
        });
    } catch (error) {
        next(error);
    }
}
module.exports.deleteMe=async(req, res, next)=>{
    try {
        //middleware protect() will check if user is logged in
        //if yes then disable this user
        let user=await User.findByIdAndUpdate(req.user._id, {active:false});
        res.status(204).json({
            status:"success"
        });

    } catch (error) {
        next(error);
    }
}
module.exports.getMe=async(req, res, next)=>{
    req.params.id=req.user.id;
    let findOne=handlerFactory.findOne(User);
    await findOne(req, res, next);
}