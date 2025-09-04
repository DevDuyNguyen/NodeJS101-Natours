const Models={}//dictionary of mongoose model, it is added below

const customErrors=require("../../errors/customeErrors");
const fs=require("fs");
Models.tour=require("../../models/tourModel");
Models.user=require("../../models/userModel");
Models.review=require("../../models/reviewModel");
const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config({path:`${__dirname}/../../config.env`});


const loadJsonFileIntoMongoDB=async (filePath, model)=>{
    try {
      let collection=fs.readFileSync(filePath, "utf-8");
      collection=JSON.parse(collection);
      await model.create(collection,{
        validateBeforeSave:false
      });
      console.log("Insert documents succeeds");
    } catch (error) {
      console.log(error);
    }
}
const deleteAllDocuemnt=async (model)=>{
  try {
    await model.deleteMany({});
    console.log("Delete documents succeeds");
    
  } catch (error) {
    console.log(error);
  }
}

let database_url=process.env.DATABASE;
database_url=database_url.replace("<DB_PASSWORD>", process.env.DB_PASSWORD);
database_url=database_url.replace("<DB_NAME>", process.env.DB_NAME);
mongoose.connect(database_url,{
  useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false,
    useUnifiedTopology: true
})
.then(async (con)=>{
  console.log("connection succeeds");
  if(process.argv[2]=="--import"){
    let model=(process.argv[4]).toLowerCase();
    if(!(model in Models)){
      throw new customErrors.ModelDoesNotExist(`Mongoose model ${model} doesn't exist`, "INVALID_MODEL");
    }
    model=Models[model];
    await loadJsonFileIntoMongoDB(process.argv[3], model);
  }
  else if(process.argv[2]=="--delete"){
    let model=(process.argv[3]).toLowerCase();
    if(!(model in Models)){
      throw new customErrors.ModelDoesNotExist(`Mongoose model ${model} doesn't exist`, "INVALID_MODEL");
    }
    model=Models[model];
    await deleteAllDocuemnt(model);
  }
  con.connection.close();
  
})
