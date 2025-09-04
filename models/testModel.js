const dotenv=require("dotenv");
dotenv.config({path:"../config.env"});

const mongoose=require("mongoose");

let testSchema=new mongoose.Schema({
    name:String,
    objs:[
        {
            age:Number,
            height:Number
        }
    ]
});
let Test=mongoose.model("Test", testSchema);
// module.exports.Test=mongoose.model("Test", testSchema);
let DB=(process.env.DATABASE).replace("<DB_PASSWORD>", process.env.DB_PASSWORD);
DB=DB.replace("<DB_NAME>", process.env.DB_NAME);

mongoose.connect(DB,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false,
    useUnifiedTopology: true
})
.then(async (con)=>{
    console.log("Database connection succeed");
    
    await Test.create({
        name:"test1",
        objs:[
            {
                age:11,
                height:183
            },
            {
                age:12,
                height:173
            }
        ]
    })

    con.connection.close();
})