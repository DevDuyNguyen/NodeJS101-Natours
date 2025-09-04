const mongoose=require("mongoose");

let locationschema=new mongoose.Schema({
    type:{
        type:String,
        default:"Point",
        enum:["Point"]
    },
    coordinates:[Number],
    address:String,
    description:String,
    day:Number
})

let Location=mongoose.model("Location", locationschema);
module.exports.LocationModel=Location;
module.exports.LocationSchame=locationschema;