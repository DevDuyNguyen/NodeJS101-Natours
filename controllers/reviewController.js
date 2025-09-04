const Review=require("../models/reviewModel");
const APIFeatures=require("../utils/APIFeatures");
const User=require("../models/userModel");
const Tour=require("../models/tourModel");
const appError=require("../utils/appError");
const handlerFactory=require("./handlerFactory");

module.exports.getAllReviews=handlerFactory.findAll(Review);
module.exports.createNewReview=handlerFactory.createObe(Review);
module.exports.deleteReviewById=handlerFactory.deleteOne(Review);
module.exports.getReviewById=handlerFactory.findOne(Review);
module.exports.updateReview=handlerFactory.updateOne(Review, ["review", "rating"]);

