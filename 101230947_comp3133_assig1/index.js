// Name: Charles Mamaril
// Student ID: 101230947
// Email: charles.mamaril@georgebrown.ca

// SETUP START ***********************
// Importing libraries
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const fileUpload = require("express-fileupload");
const session = require("express-session");

// Load dotenv variables
require("dotenv").config({path:"./config/config.env"});

// Import routes
const userRoutes = require("./routes/user");
const roomRoutes = require("./routes/room");
const generalRoutes = require("./routes/general");

// Create express object
const app = express();

// Setup express
app.use(bodyParser.urlencoded({extended: false}));
app.use(fileUpload());
app.use(methodOverride("_method"));
app.use(express.static("public"));

// Session setup
app.use(session({secret: "This is my secret key.",
    resave: true,
    saveUninitialized: true}));
app.use((req,res,next) => {
    res.locals.t = req.session.userInfo;
    next();
});

// Map express to routes objects
app.use("/",generalRoutes);
app.use("/user",userRoutes);
app.use("/room",roomRoutes);

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
// ************************* SETUP END


// DATABASE CONNECTION START ************
const mongoDBUrl = `mongodb+srv://${process.env.dbUser}:${process.env.dbPass}@cluster0-apgkj.mongodb.net/${process.env.dbName}?retryWrites=true&w=majority`;
mongoose.connect(mongoDBUrl, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log(`Connected to database`);
    })
    .catch((err) => {
        console.log(`Error connecting to database: ${err}`);
    });
// ************** DATABASE CONNECTION END


// WEB SERVER SETUP START ************
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Web server is listening on port ${PORT}`);
});
// ************** WEB SERVER SETUP END
