const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config({path:"./config.env"});
const app=require("./app");


let DB=(process.env.DATABASE).replace("<DB_PASSWORD>", process.env.DB_PASSWORD);
DB=DB.replace("<DB_NAME>", process.env.DB_NAME);

mongoose.connect(DB,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false,
    useUnifiedTopology: true
})
.then(con=>{
    console.log("connection succeed");
    app.listen(process.env.PORT, ()=>{
        console.log(`server start at port ${process.env.PORT}`);    
    });
    // loadJsonFileIntoMongoDB(`${__dirname}//dev-data/data/tours-simple.json`, Tour);
})


//Dhs@123456