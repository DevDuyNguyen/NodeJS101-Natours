const mongoose=require("mongoose");
const {LocationSchame}=require("./locationModel");
const User=require("./userModel");

let tourSchema=mongoose.Schema({
    __v:{
        select:false
    }, 
    name:{
        type: String,
        required:[true, "A tour must have a name"],
        uniqued:[true, "name already exists"],
        minLength:[10, "The tour's name must be at least 10 characters"],
        maxLength:[40, "The tour's name must be at most 40 characters"]
    },
    duration:{
        type:Number,
        required:[true, "A tour must have a duration"]
    },
    maxGroupSize:{
        type: Number,
        required:[true, "A tour must have a group size"]
    },
    difficulty:{
        type:String,
        required:[true, "A tour must have a difficulty"],
        enum:{
            values:["easy","medium","difficult"],
            message:`{VALUE} is not in (easy,medium,difficult)`
        }
    },
    ratingsAverage:{
        type: Number,
        default:4.5,
        min:[1, "rating must be at least 1"],
        max:[5, "rating must be at most 5"]
    },
    ratingsQuanitity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true, "A tour must have a price"]
    },
    priceDiscount:{
        type:Number,
        validate:{
            validator:function(val){
                return this.price>=this.priceDiscount;
            },
            message:"priceDiscount cannot be greater than price"
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true, "A tour must have a summary"]
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true, "A tour must have a cover image"]
    },
    images:[String],
    createAt:{
        type:Date,
        defaul:Date.now()
    },
    startDates:[Date],
    startLocation:{
        type:{
            type:String,
            default:"Point",
            enum:["Point"]
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[LocationSchame],
    guides:[{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

//indexes
tourSchema.index({
    price:1,
    ratingsAverage:-1
});
tourSchema.index({
    startLocation:"2dsphere"
});

//virtual property
tourSchema.virtual("durationInWeek").get(function(){
    let wholeWeek=Math.floor(this.duration/7);
    if(!wholeWeek)
        return `${this.duration} days`;
    let remaindingDays=this.duration-wholeWeek*7;

    if(remaindingDays)
        return `${wholeWeek} weeks ${remaindingDays} days`;
    else
        return `${wholeWeek} weeks`;   
});

//virtual populate
tourSchema.virtual("reviews",{
    ref:"Review",
    localField:'_id',
    foreignField:'tour'
});

let Tour=mongoose.model("Tour", tourSchema);

module.exports=Tour;
