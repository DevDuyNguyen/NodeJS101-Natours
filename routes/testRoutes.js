const express=require("express");
const Tour=require("../models/tourModel");

let router=express.Router();

router.get("/test-global-error-handling", (req, res)=>{
    Tour.create({asdf:11});
})

module.exports=router;