const express=require("express")
const tourRouter=require("./routes/tourRoues");
const userRouter=require("./routes/userRoutes");
const testRouter=require("./routes/testRoutes");
const reviewRouter=require("./routes/reviewRoutes");
const viewRouter=require("./routes/viewRoutes");
const errorHandlers=require("./utils/errorHandlers");
const rateLimit=require("express-rate-limit");
const mongoSanitization=require("express-mongo-sanitize");
const xss=require("xss-clean");
const hpp=require("hpp");
const path=require("path");

//function
function parseCookie(req, res, next){
    let cookieRaw=req.headers.cookie;
    req.cookies={};
    if(cookieRaw){
        let cookies=cookieRaw.split(';');
        let cookieJSON={};
        for(let cookie of cookies){
            let arr=cookie.split('=');
            cookieJSON[arr[0]]=arr[1];
        }
        req.cookies=cookieJSON;
    }
    next();
}

// configure Express app
let app=express();
app.set("view engine", "pug");
app.set("views",path.join(__dirname,'views'))
app.use(express.json());
app.use(express.urlencoded());
const limiter=rateLimit({
    max:100,
    windowsMS:60*60*1000,
    message:"too many request, please retry in one hour"
})
app.use(parseCookie);
app.use("/api", limiter)
app.use(mongoSanitization());
app.use(xss());
app.use((req, res, next)=>{
    // console.log("Before hpp:");
    // console.log(req.query);
    next()
    
})
app.use(hpp({
    whitelist:["duration"]
}));
app.use(express.static(path.join(__dirname,"public")))

//Router
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter)
app.use("/", viewRouter);


//handling unhandled routes
app.all("*",(req, res, next)=>{
    let err=new Error(`route ${req.originalUrl} is not found`);
    err.statusCode=404;
    err.status="fail"
    next(err);
})

app.use('/api/v1/test', testRouter);

// global error handling
app.use(errorHandlers.globalErrorHandler);


module.exports=app;