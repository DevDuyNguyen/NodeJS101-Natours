const Tour=require("../models/tourModel");
const appError=require("../utils/appError");
const User=require('../models/userModel');

module.exports.getOverview=async (req, res, next)=>{
    let tours=await Tour.find();

    res.status(200).render("overview",{
        title:"Tour overview",
        tours:tours
    })
}
module.exports.getTourDetail=async (req, res, next)=>{
    try {
        let tour=await Tour.findById(req.params.tourId)
        .populate({
            path:'guides',
        })
        .populate({
            path:'reviews'
        });

        if(!tour)
            return next(new appError("Tour doesn't exist"), 404, "fail");
        res.status(200).render("tour",{
            title:tour.name,
            tour:tour
        });

    } catch (error) {
        next(error);
    }
}
module.exports.getLoginScreen=(req, res)=>{
    res.status(200).render('login',{title:"Login"});
}
module.exports.getCurrentAccount=(req, res)=>{
    res.status(200).render('account',{
        title:'Your account',
        user:req.user//received from authController.protect()
    });
}
module.exports.updateUserData=async (req, res, next)=>{
    try {
        let user=await User.findByIdAndUpdate(req.user.id,{
            name:req.body.name,
            email:req.body.email
        },{
            new:true,
            runValidators:true
        });
        res.status(200).render('account',{
            title:"Your account",
            user:user
        });

    } catch (error) {
        next(error);
    }
}