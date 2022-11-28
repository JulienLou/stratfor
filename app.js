require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { connectDB } = require('./database/mongoose');
const userRoutes = require("./routes/userRoutes");
const app = express();
const port = process.env.PORT;
const secretKey = process.env.SECRET;

connectDB().catch(err => console.log(err));

app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.set('trust proxy', 1);
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: true } // https only (not for dev)
}));
app.use(flash());

app.get("/", (req, res) => {
  res.redirect("login");
});

app.use("/", userRoutes);

app.use((req, res) => {
  res.status(404);
  res.redirect("page404");
});

app.use((err, req, res, next) => { // when ready to catchAsync()
  console.log(err);
  res.status(500);
  res.send("Internal Server Error");
});

app.listen(port, () => {
  console.log(`App is running at: http://localhost:${port}`);
});