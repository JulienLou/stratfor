const jwt = require("jsonwebtoken");
const User = require("../models/User");
const catchAsync = require("../helpers/catchAsync");
const secretToken = process.env.S_TOKEN;

const authentication = catchAsync(async(req, res, next) => {
  try{
    const authToken =  req.cookies.authorization.replace("Bearer ", "");
    const decodedToken = jwt.verify(authToken, secretToken);
    const user = await User.findOne({ _id: decodedToken._id, "authTokens.authToken": authToken });
    if(!user) throw new Error();
    
    req.authToken = authToken;
    req.user = user;

    next();
  }catch(err){
    res.status(401);
    req.flash("error", "You must authenticate to access the contents of Stratfor...");
    res.redirect("login");
  }
});

module.exports = authentication;