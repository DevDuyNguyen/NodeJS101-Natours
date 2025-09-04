const express=require("express");
const reviewController=require("../controllers/reviewController");
const authController=require("../controllers/authController");
const User=require("../models/userModel");
const Tour=require("../models/tourModel");
const appError=require("../utils/appError");

const router=express.Router({mergeParams:true});

router.use(authController.protect);

router.route("/")
.get(reviewController.getAllReviews)
.post(authController.restrictedTo("user"), 
    async (req, res, next)=>{
        req.body.user=req.body.user||req.user._id;
        req.body.tour=req.body.tour||req.params.tourId;


        let user=await User.findById(req.body.user);
        if(!user)
            next(new appError("User doesn't exist", 404, "fail"));
        let tour=await Tour.findById(req.body.tour);
        if(!tour)
            next(new appError("Tour dones't exist", 404, "fail"));
        next();
    },
    reviewController.createNewReview);

router.route("/:id")
.get(reviewController.getReviewById)
.delete(authController.protect,
    authController.restrictedTo("user","admin"),
    reviewController.deleteReviewById)
.patch(authController.protect,
    authController.restrictedTo("user","admin"),
    reviewController.updateReview);

module.exports=router;

