const express=require("express");
const viewController=require("../controllers/viewController");
const authController=require("../controllers/authController");

const router=express.Router();

router.get("/",authController.isLoggedIn, viewController.getOverview);
router.get("/tour/:tourId",authController.isLoggedIn,viewController.getTourDetail)
router.get("/login",authController.isLoggedIn, viewController.getLoginScreen);
router.get("/me", authController.protect, viewController.getCurrentAccount);
router.post("/submit-user-data", authController.protect, viewController.updateUserData);

module.exports=router;