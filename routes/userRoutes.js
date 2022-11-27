const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authentication = require("../middlewares/authentication");


router.get("/users", authentication, userController.showUsers); 
router.get("/register", userController.registerForm);    
router.post("/register", userController.register);    

router.get("/login", userController.loginForm); 
router.post("/login", userController.login); 
router.get("/logout", authentication, userController.logout); 


module.exports = router;