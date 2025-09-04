const mongoose=require("mongoose");
const validator=require("validator");
const bcryptjs=require("bcryptjs");
const crypto=require("crypto");


let userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true, "name is missing"]
    },
    email:{
        type:String,
        lowercase:true,
        required:[true, "email is missing"],
        validate:{
            validator:validator.isEmail,
            message:'{VALUE} is not in email format'
        },
        unique:true
    },
    photo:{
        type:String
    },
    password:{
        type:String,
        required:[true, "password is missing"],
        minLength:[8,"password must be at least 8 characters"],
        //[interesting: implement powerful network requirement]
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true, "password must be comfirmed"],
        validate:{
            validator:function(val){
                return this.password===val;
            },
            message:"confirm password doesn't match password"
        }
    },
    __v:{
        select:false
    },
    passwordChangeAt:Date,
    role:{
        type:String,
        enum:["user", "guide", "lead-guide", "admin"],
        default:"user"
    },
    resetToken:String,
    resetTokenExpiresAt:Date,
    active:{//explain
        type:Boolean,
        default:true,
        required:true,
        select:false
    }
    
});
//hooks
userSchema.pre("save", async function(next){
    
    this.password=await bcryptjs.hash(this.password, 12);
    this.passwordConfirm=undefined;
    next();
})
//ensure that deleted user will not be used
userSchema.pre(/^find/, function(next){
    this.find({active:{$ne:false}});
    next();
})

//Methods
userSchema.methods.checkPassword=async function(candidatePass, databasePass){
    return await bcryptjs.compare(candidatePass, databasePass);
}
userSchema.methods.passwordChangeAfter=function(timeInSecond){
    if(this.passwordChangeAt)//explain
    {
        let passwordChangeAtSecond=parseInt(this.passwordChangeAt.getTime()/1000, 10);
        return timeInSecond<passwordChangeAtSecond;
    }
    return false;
}
userSchema.methods.createPasswordResetToken=function(){
    let resetToken=crypto.randomBytes(32).toString("hex");
    this.resetToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetTokenExpiresAt=Date.now()+10*60000
    return resetToken;
}


let User=mongoose.model("User", userSchema);
module.exports=User;