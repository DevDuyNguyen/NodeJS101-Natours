const express=require("express");
const tourController=require("../controllers/tourController");
const authController=require("../controllers/authController");
const reviewRouter=require("./reviewRoutes");

let router=express.Router();

router.route("/test")
.get((req, res)=>{
    console.log("this is /test=====================");
    
    console.log(x);
});

router.route("/top-5-cheap").get(tourController.aliasTop5Cheap,
    tourController.getAllTours
);

router.route("/tour-stats").get(tourController.getTourStats);

router.route("/get-busiest-month/:year").
get(authController.protect, 
    authController.restrictedTo("admin", "lead-guide","guide"),
    tourController.getBusiestMonthOfYear);

router.route("/tours-within/:distance/center/:latlong/unit/:unit")
.get(tourController.getTourWithin);

router.route("/distances/:latlong/unit/:unit")
.get(tourController.getDistances);

router.route("/")
.get(tourController.getAllTours)
.post(authController.protect, 
    authController.restrictedTo("admin", "lead-guide"),
    tourController.createNewTour);

router.route("/:id")
.get(tourController.getTourById)
.patch(authController.protect, 
    authController.restrictedTo("admin", "lead-guide"),
    tourController.updateTour)
.delete(authController.protect,
    authController.restrictedTo("admin", "lead-tour"),
    tourController.deleteTour
);


router.use("/:tourId/reviews", reviewRouter);



// router.use((err, req, res, next)=>{
//     let statusCode=err.statusCode || 500;
//     let status=err.status || "error";
//     res.status(err.statusCode).json({
//         status:err.status,
//         message:err.message
//     });
// });


module.exports=router;