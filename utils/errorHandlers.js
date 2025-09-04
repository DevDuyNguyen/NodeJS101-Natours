const appError = require("./appError");

function handleCastErrorDB(err){
    return new appError(`cannot cast ${err.path}:${err.value}`, 400, "fail");
}
function handleDuplicateValueUniqueFieldDB(err){
    // console.log(`message:${err.message}.`);
    let message=err.message.match(/"([^"]*)"/)[0];
    // console.log("message1:",message);
    
    return new appError(`the value ${message} is duplicated, please choose another variable`, 400, "fail");
}
function handleValidationDB(err){
    let errors=Object.values(err.errors).map(el=>el.message).join(", ");
    return new appError(errors, 400, "fail");
}
function handleJsonWebTokenError(err){
    return new appError("Token is invalid", 401, "fail");
}
function handleJwtExpired(err){
    return new appError("JWT is expired", 401, "fail");
}
function handleInvalidObjectID(err){
    return new appError(`Id ${err.value} doesn't exist`, 404, "fail");
}

module.exports.globalErrorHandler=(err, req, res, next)=>{
    err.statusCode=err.statusCode || 500;
    err.status=err.status || "error";
    
    if(process.env.NODE_ENV=='development'){
        console.error(err);
        if(req.originalUrl.startsWith('/api')){
            return res.status(err.statusCode).json({
                status:err.status,
                message:err.message,
                error:err,
                stack:err.stack
            });
        }
        else{
            return res.status(err.statusCode)
                .render('error',{
                    title:'Something went wrong',
                    message:err.message
                });
        }
        
    }
    else if(process.env.NODE_ENV=="production"){
        console.error(err);

        let error=Object.assign(err);
        if(err.name==="CastError")
            error=handleCastErrorDB(error);
        else if(err.code===11000)
            error=handleDuplicateValueUniqueFieldDB(error);
        else if(err.name==="ValidationError")
            error=handleValidationDB(error);
        else if(err.name==="JsonWebTokenError")
            error=handleJsonWebTokenError();
        else if(err.name==="TokenExpiredError")
            error=handleJwtExpired(error);
        else if(err.kind==="ObjectId")
            error=handleInvalidObjectID(error);
        
        if(req.originalUrl.startsWith('/api')){
            if(error.isOperationalError){
                return res.status(error.statusCode).json({
                    status:error.status,
                    message:error.message
                });
            }
            else{
                console.error(error);
                return res.status(500).json({
                    status:"error",
                    message:"something went wrong"
                })
            }
        }
        else{
            if(error.isOperationalError){
                return res.status(error.statusCode)
                .render('error',{
                    title:'Something went wrong',
                    message:error.message
                });
            }
            else{
                return res.status(500)
                .render('error',{
                    title:'Something went wrong',
                    message:"something went wrong"
                });
            }
        }
    }



}