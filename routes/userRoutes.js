let express=require("express");
let userController=require("../controllers/userController");
let authController=require("../controllers/authController");

let router=express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.get('/logout', authController.logout);
router.post("/forgetPassword", userController.forgetPassword);
router.patch("/resetPassword/:token", authController.resetPassowrd);

router.use(authController.protect)
router.patch("/updatePassword", authController.updatePassword);
router.patch("/updateMe", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);
router.route("/me").get(userController.getMe);

if(process.env.NODE_ENV==="development"){
    router.route("/")
    .get(userController.getAllUsers)
    .post(userController.createNewUser);

    router.route("/:id")
    .get(userController.getUserByID)
    .delete(userController.deleteUserByID)
    .patch(userController.updateUserByID);

}
else{
    router.use(authController.restrictedTo("admin"));

     router.route("/")
    .get(userController.getAllUsers)
    .post(userController.createNewUser);

    router.route("/:id")
    .get(userController.getUserByID)
    .delete(userController.deleteUserByID)
    .patch(userController.updateUserByID);

}


module.exports=router;
