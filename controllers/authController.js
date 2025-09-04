const User=require("../models/userModel");
const jwt=require("jsonwebtoken");
const appError=require("../utils/appError");
const {promisify}=require("util");
const crypto=require("crypto")

function createAndSendJWT(user, res, statusCode, status){
    let token=jwt.sign({id:user._id},
         process.env.JWT_KEY, 
         {expiresIn:process.env.JWT_EXPIRE_IN});
    let httpCookieOptions={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE_IN*24*60*60*1000),
        httpOnly:true,
        secure:true
    }
    if(process.env.NODE_ENV==="development")
        httpCookieOptions.secure=false;
    res.cookie("jwt", token, httpCookieOptions);
    res.status(statusCode).json({
        status:status,
        data:user
    })
}

module.exports.signUp=async(req, res, next)=>{
    try {
        let user=await User.create({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            passwordConfirm:req.body.passwordConfirm,
            passwordChangeAt:req.body.passwordChangeAt
        });
        user.password=undefined;
        // let jwtToken=jwt.sign({id:user._id}, process.env.JWT_KEY, {
        //     expiresIn:process.env.JWT_EXPIRE_IN
        // });

        // res.status(201).json({
        //     status:"sucess",
        //     data:user,
        //     token:jwtToken
        // });

        createAndSendJWT(user, res, 201, "success");
    } catch (error) {
        error.statusCode=400;
        error.status="fail";
        next(error);
    }
}
module.exports.login=async (req, res, next)=>{
    let email=req.body.email;
    let password=req.body.password;
    if(!email || !password){
        return next(new appError("Must provide email and password", 401, "fail"));
    }
    try {
        let user=await User.findOne({email:email}).select("+password");
        if(!user || !(await user.checkPassword(password, user.password))){
            return next(new appError("email or password is incorrect", 401, "fail"));
        }
        let i=user.checkPassword(password, user.password);
        let token=jwt.sign({id:user._id}, process.env.JWT_KEY, {
            expiresIn:process.env.JWT_EXPIRE_IN
        });
        user.password=undefined;
        
        createAndSendJWT(user, res, 200, "success");
    } catch (error) {
        next(error);
    }

}
module.exports.protect=async(req, res, next)=>{
    //check if request has token
    //update: jwt is stored in cookie jwt
    if( !req.cookies.jwt && (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer"))){
        return next(new appError("you are not logged in", 401, "fail"));
    }
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
        token=req.headers.authorization.slice(7);
    else
        token=req.cookies.jwt;
    //verify jwt token
    let payload=null;
    try {
        payload=await promisify(jwt.verify)(token, process.env.JWT_KEY);
        
    } catch (error) {
        return next(error)
    }
    //check if user still exist
    let user=await User.findById(payload.id);
    if(!user){
        return next(new appError("User doesn't exist anymore", 401, "fail"));
    }
    //check if password is changed after jwt
    if(user.passwordChangeAfter(payload.iat)){
        return next(new appError("password is changed recently", 401, "fail"));
    }
    req.user=user;

    next();
}
module.exports.restrictedTo=(...roles)=>{
    return async (req, res, next)=>{
        for(let allowRole of roles){
            if(allowRole===req.user.role)
                return next()
        }
        return next(new appError(`${req.user.role} isn't authorized`, 403, "fail"));
    }
}
module.exports.resetPassowrd=async(req, res, next)=>{
    try {
        //get user from the token
        //if token isn't expired, set the password
        let hashedToken=crypto.createHash("sha256").update(req.params.token).digest("hex");
        let user=await User.findOne({
            resetToken:hashedToken,
            resetTokenExpiresAt:{$gt: Date.now()}
        })
        if(!user)
            return next(new appError("token is invalid or expired", 404, "fail"));

        user.password=req.body.password;//(1): explain
        user.passwordConfirm=req.body.passwordConfirm;

        //change properties related to this password reset: passwordChangeAt, 
        //resetToken, resetTokenExpiresAt
        user.resetToken=undefined;
        user.resetTokenExpiresAt=undefined;
        user.passwordChangeAt=Date.now();
        await user.save();

        //login user via jwt
        let loginToken=jwt.sign({id:user.__id}, process.env.JWT_KEY,{
            expiresIn:process.env.JWT_EXPIRE_IN
        });

        res.status(201).json({
            status:"success",
            message:"Your password has been successfully rest",
            token:loginToken
        })

    } catch (error) {
        next(error);
    }

}

module.exports.updatePassword=async(req, res, next)=>{
    try {
        //check if user is logged in via protect() middleware
        
        //get user password
        let currentPassword=(await User.findById(req.user.id).select("+password")).password;

        //check if the posted password is valid
        if(!(await req.user.checkPassword(req.body.postedPassword, currentPassword)))
            return next(new appError("wrong password", 400, "fail"));
        //if yes, update password, login user via jwt
        //updated related properties of this process:passwordChangeAt
        req.user.password=req.body.newPassword;//(1) explain
        req.user.passwordConfirm=req.body.passwordConfirm;
        req.user.passwordChangeAt=Date.now();
        let token=jwt.sign({id:req.user.__id}, process.env.JWT_KEY, {
            expiresIn:process.env.JWT_EXPIRE_IN
        });
        await req.user.save();

        res.status(200).json({
            status:"success",
            token:token,
            message:"Your password has been successfully updated"
        });
    } catch (error) {
        next(error);
    }

}
module.exports.isLoggedIn=async(req, res, next)=>{
    //check if request has token
    //update: jwt is stored in cookie jwt
    if( req.cookies.jwt){    
        token=req.cookies.jwt;
        //verify jwt token
        let payload=null;
        try {
            payload=await promisify(jwt.verify)(token, process.env.JWT_KEY);
            
        } catch (error) {
            return next()//(1)
        }
        //check if user still exist
        let user=await User.findById(payload.id);
        if(!user){
            return next();//(1)
        }
        //check if password is changed after jwt
        if(user.passwordChangeAfter(payload.iat)){
            return next();//(1)
        }
        res.locals.user=user;
        return next();//(2)
    }
    next();//(1)
}
module.exports.logout=(req, res, next)=>{
    let httpCookieOptions={
        expires:new Date(Date.now()+5*1000),
        httpOnly:true
    }
    res.cookie('jwt','', httpCookieOptions);
    res.status(200).json({
        status:"success"
    });
}
