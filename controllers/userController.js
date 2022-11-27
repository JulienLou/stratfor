const User = require("../models/User");
//const catchAsync = require("../helpers/catchAsync");
const validator = require("validator");
const striptags = require('striptags');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { send } = require("process");
const secretToken = process.env.S_TOKEN;

// users page
const showUsers = async(req, res) => {
  const usersFound = await User.find().select("-password, -authTokens").sort({name: 'asc', firstname: 'asc'});
  res.render("users", { 
    title: "Users",
    users: usersFound,
    infos: req.flash("info")
  });
};

// register form page
const registerForm = async(req, res) => {
  res.render("register", { 
    title: "Register", 
    errors: req.flash("error")
  });
};

// create user account
const register = async(req, res) => {
  if(!req.body.name || !req.body.firstname || !req.body.email || !req.body.password){
    req.flash("error", "Registration error, please check your information...");
    res.redirect("register");
    return;
  };

  const name = striptags(req.body.name);
  const firstname = striptags(req.body.firstname);
  const email = striptags(req.body.email);
  const password = striptags(req.body.password);

  const useremail = await User.findOne({email});
  if(useremail){
    req.flash("error", "It's look like your email address is already registered...");
    res.redirect("register");
    return;
  }

  if(!validator.isEmail(email)){
    req.flash("error", "Your email address does not seem valid.");
    res.redirect("register");
    return;
  };

  if(!validator.isLength(password, {min:6, max: 20})){
    req.flash("error", "Your password must contain between 6 and 20 characters.");
    res.redirect("register");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name: name, 
    firstname: firstname,
    email: email,
    password: hashedPassword
  });

  req.flash("info", "Your account was created. Now, log in to access Stratfor content");
  res.redirect("login");
};

// login form page
const loginForm = async(req, res) => {
  res.render("login", { 
    title: "Login", 
    errors: req.flash("error"),
    infos: req.flash("info")
  });
};

// login form submit
const login = async(req, res) => {

  if(!req.body.email || !req.body.password){
    req.flash("error", "Connection error, please check your information");
    res.redirect("register");
    return;
  };

  const email = striptags(req.body.email);
  const password = striptags(req.body.password);
  const user = await User.findOne({email});

  if(!user){
    req.flash("error", "Incorrect email or password");
    res.redirect("login");
    return;
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if(!isPasswordValid) {
    req.flash("error", "Incorrect email or password");
    res.redirect("login");
    return;
  }

  // Token
  const userID = user._id.toString();
  let authToken = jwt.sign({ _id: userID}, secretToken);

  let authTokens = user.authTokens;
  authTokens.push({ authToken });
  await User.updateOne({ _id: userID }, { $set: { authTokens: authTokens } });

  res.cookie('authorization', 'Bearer '+ authToken, {httpOnly: true});
  req.flash("info", "You are logged in, you can now visit the list of users."); 
  res.redirect("users");
};

// logout
const logout =  async(req, res) => {
  try {
    req.user.authTokens = req.user.authTokens.filter((authToken) => {
      return authToken.authToken !== req.authToken;
    });
    req.user.authTokens = [];
    res.clearCookie('authorization');
    await req.user.save();
    res.redirect("login");
  } catch (err) {
   res.status(500).send(); 
  }
};

module.exports = {
  showUsers,
  registerForm,
  register,
  loginForm,
  login,
  logout
}