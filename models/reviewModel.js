const mongoose=require("mongoose");
const Tour=require("./tourModel");

let reviewSchema=new mongoose.Schema({
    review:{
        type:String,
        required:[true,"a review must have a review"]
    },
    rating:{
        type:Number,
        required:[true, "please leave a rating"],
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:[true, "review must be created by a user"]
    },
    tour:{
        type:mongoose.Types.ObjectId,
        ref:"Tour",
        required:[true, "review must be created for a tour"]
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

reviewSchema.pre(/^find/, function(next){
    this
    .populate({
        path:'user',
        select:{
            name:true,
            photo:true
        }
    })
    // .populate({
    //     path:'tour',
    //     select:{
    //         name:true
    //     }
    // });

    next();
})

//indexes
reviewSchema.index({tour:1, user:1}, {unique:true});

//static method: Model method
reviewSchema.statics.updateTourRating=async function(tourId){
    let stats=await this.aggregate([
        {$match:{tour:tourId}},
        {
            $group:{
                _id:null,
                noRating:{$sum:1},
                ratingsAverage:{$avg:'$rating'}
            }
        }
    ]);
    console.log(stats);
    
    if(stats.length>0)
    {    
        await Tour.findByIdAndUpdate(tourId,{
            ratingsAverage:stats[0].ratingsAverage,
            ratingsQuanitity:stats[0].noRating
        })
    }
    else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsAverage:4.5,
            ratingsQuanitity:0
        })
    }

}
reviewSchema.post("save", async function(doc, next){
    // console.log(this);
    await this.constructor.updateTourRating(this.tour);
    next();
})
reviewSchema.post(/^findOneAnd/, async function(doc, next){
    if(doc)
        await doc.constructor.updateTourRating(doc.tour)
    next();
})


let reviewModel=mongoose.model("Review", reviewSchema);

module.exports=reviewModel;
