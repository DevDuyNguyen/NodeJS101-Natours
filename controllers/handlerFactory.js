const appError=require("../utils/appError");
const APIFeatures=require("../utils/APIFeatures");
const commonFunc=require("../utils/commonFunc");


module.exports.deleteOne=Model=>{
    return async(req, res, next)=>{
        try {
            let document=await Model.findByIdAndDelete(req.params.id);
            if(!document){
                next(new appError("This document id doesn't exist", 404, "fail"));
            }
            res.status(204).json({
                status:"success",
                data:null
            });
        } catch (error) {
            next(error);
        }
    }
}
//input:take Mongoose Model, array of populate option of Query.populate()
//output:produce get one document function
module.exports.findOne=(Model, populateOptions)=>{
    return async (req, res, next)=>{
        try{
            let query=Model.find({_id:req.params.id})
            if(populateOptions){
                for(let option of populateOptions){
                    query.populate(option);
                }
            }
            let document=await query;
            if(!document){
                next(new appError("This document id doesn't exist", 404, "fail"));
            }
            res.status(200).json({
                status:"success",
                data:document
            });
        }
        catch(err){
            err.statusCode=400;
            err.status="fail";
            next(err);
        }
    }
}
//input: Model, array of populate options for Mongoose Query.populate()
//output: function for query all document of Model
module.exports.findAll=(Model, populateOptions)=>{
    return async (req, res, next)=>{
        try{    
            //for nested GET review
            let filter;  
            if(req.params.tourId)
                filter={tour:req.params.tourId};

            let query=Model.find(filter);
            if(populateOptions){
                for(let option of populateOptions)
                    query.populate(option);
            }

            let features=new APIFeatures(query, req.query, Model);
            features
            .filter()
            .sorting()
            .limitFields();
            await features.pagination();

            let documents=await query;

            res.status(200).json({
                status:"success",
                data:documents
            });
        }
        catch(err){
            next(err);
        }

    }
}
//input: mongoose Model+array of allowed fields+array of unallowed fields
module.exports.updateOne=(Model, allowFields=[], unAllowedFields=[])=>{
    return async(req, res, next)=>{
        try {
            let id=req.params.id;
            if(allowFields.length>0)
                req.body=commonFunc.fileterAllowFields(req.body, ...allowFields);
            if(unAllowedFields.length>0)
                req.body=commonFunc.removeUnAllowedFields(req.body, ...unAllowedFields);
            let updatedDoc=await Model.findByIdAndUpdate(id, req.body, {
                new:true,
                runValidators:true
            });
            if(!updatedDoc)
                next(new appError("This document id doesn't exist",404, "fail"));
            res.status(200).json({
                status:"success",
                data:updatedDoc
            });

        } catch (err) {
            next(err);
        }

    }
}
module.exports.createObe=(Model)=>{
    return async (req, res, next)=>{
        try{
            let newDoc= await Model.create(req.body);
            res.status(201).json({
                status:"success",
                data:newDoc
            });
        }
        catch(err){
            next(err);
        }

    }
}