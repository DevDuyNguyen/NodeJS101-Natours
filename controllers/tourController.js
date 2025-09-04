const mongoose = require("mongoose");
const Tour=require("../models/tourModel");
const APIFeatures=require("../utils/APIFeatures");
const appError=require("../utils/appError");
const handlerFactory=require("./handlerFactory");

module.exports.aliasTop5Cheap=(req, res, next)=>{
    req.query.limit=6;
    req.query.sort="-ratingsAverage,price";
    req.query.fields="price,ratingsAverage,name";
    next();
}

module.exports.getAllTours=handlerFactory.findAll(Tour,[ {path:"guides"}]);
module.exports.createNewTour=handlerFactory.createObe(Tour);
module.exports.getTourById=handlerFactory.findOne(Tour,[
    {
        path:'guides',
        select:{
            __v:false,
            passwordChangeAt:false
        }
    },
    {
        path:"reviews",
        select:{
            review:true
        }
    }
]);

module.exports.updateTour=handlerFactory.updateOne(Tour);
module.exports.deleteTour=handlerFactory.deleteOne(Tour);
module.exports.getTourStats=async(req, res, next)=>{

    try {
        let tourStats=await Tour.aggregate([
            {
                $match:{}
            },
            {
                $group:{
                    _id:'$difficulty',
                    averagePrice:{$avg:'$price'},
                    averageRating:{$avg:'$ratingsAverage'},
                    numTours:{$sum:1},
                    minPrice:{$min:'$price'},
                    maxPrice:{$max:'price'}
                }
            }
        ]);
        if(!tourStats){
            next(new appError("The result of tour status is empty", 500, "error"));
        }   
        res.status(200).send({
            status:"success",
            data:{
                status:tourStats
            }
        })  
    } catch (error) {
        err.statusCode=404;
        err.status="fail";
        next(err);
    }
}
module.exports.getBusiestMonthOfYear=async(req,res,next)=>{
    let year=new Number(req.params.year);
    try {
            let busiestMonth=await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-1-1`),
                        $lte:new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group:{
                    _id:{$month:'$startDates'},
                    numTour:{$sum:1},
                    toursName:{$addToSet:'$name'}
                }
            },
            {
                $addFields:{
                    month:'$_id'
                }
            },
            {
                $project:{
                    _id:false
                }
            },
            {
                $sort:{
                    numTour:-1
                }
            },
            {
                $limit:1
            }
        ])
        if(!busiestMonth || busiestMonth.length===0){
            next(new appError("The input year result in an empty calculation", 404, "fail"));
            return;
        }
        res.status(200).json({
            status:"success",
            data:busiestMonth
        });
    } catch (error) {
        err.statusCode=404;
        err.status="fail";
        next(err);
    }


}

//No longer need this one, cause Mongoose schema has validation options 
// module.exports.checkBody=(req, res, next)=>{
//     if(!req.body.price || !req.body.name){
//         res.status(400).json({
//             status:"fail",
//             message:"price or name is undefined"
//         });
//     }
//     else{
//         next();
//     }
// }

module.exports.getTourWithin=async (req, res, next)=>{
    try {
        const {distance, latlong, unit}=req.params;
        let [latitude, longtitude]=latlong.split(",")
        let radRadius;
        if(unit==="mi")
            radRadius=distance/3963;
        else if(unit==="km")
            radRadius=distance/6378;
        else
            return next(new APIFeatures(`unit ${unit} is not supported, please use mile(mi) or kilometer(km)`));

        if(!latitude || !longtitude)
            return next(new APIFeatures("Pleaes provide latitude, longtitude in the format of lat,long"));
        let tours=await Tour.find({
            startLocation:{
                $geoWithin:{
                    $centerSphere:[[longtitude,latitude],radRadius]
                }
            }
        });
        res.status(200).json({
            status:"success",
            data:tours
        })

    } catch (error) {
        next(error)
    }
}

module.exports.getDistances=async (req, res, next)=>{
    try {
        const {distance, latlong, unit}=req.params;
        let [latitude, longtitude]=latlong.split(",")
        let multiplier;
        if(unit==="mi")
            multiplier=0.000621371;
        else if(unit==="km")
            multiplier=0.001;
        else
            return next(new APIFeatures(`unit ${unit} is not supported, please use mile(mi) or kilometer(km)`));

        if(!latitude || !longtitude)
            return next(new APIFeatures("Pleaes provide latitude, longtitude in the format of lat,long"));
        
        let distances=await Tour.aggregate([
            {
                $geoNear:{
                    distanceField:"distance",
                    distanceMultiplier:multiplier,
                    near:{
                        type:"Point",
                        coordinates:[longtitude*1, latitude*1]
                    }
                },
            },{
                $project:{
                    name:1,
                    _id:1,
                    distance:1
                }
            }
        ]);
        res.status(200).json({
            status:"success",
            data:distances
        })

    } catch (error) {
        next(error);
    }
}