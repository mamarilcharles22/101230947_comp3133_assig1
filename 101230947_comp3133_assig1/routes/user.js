// Load modules
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Room = require("../models/room");

// Import authentication
const userAccess = require("../authentication/user");
const adminAccess = require("../authentication/admin");

// REGULAR EXPRESSION
// Email
const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegexp = /^[A-Za-z0-9]{6,12}$/;

// Allows CRUD operations
const User = require("../models/user");

// Route to user dashboard
router.get("/dashboard", userAccess, (req, res) => {
    res.render("users/dashboard");
});

// Route to admin dashboard
router.get("/admin", adminAccess, (req, res) => {
    Room.find()
        .then((rooms) => {
            res.render("users/admin", {
                list: rooms
            });
        })
        .catch(err=>console.log(`Error: ${err}`));
});

// Logout router
router.get("/logout", (req,res) => {

    // Destroy the session
    req.session.destroy();
    res.redirect("/user/login");
});

// Route to user registration
router.get("/registration", (req,res) => {
    res.render("users/registration");
});

// User registration form process
router.post("/registration", (req,res) => {

    // User validation
    const newUser = {
        email: req.body.email,
        fName: req.body.fName,
        lName: req.body.lName,
        password: req.body.psw
    }

    const errors = [];

    // Check if user is unique
    User.findOne({email: newUser.email})
        .then(t => {
            if (t) {
                errors.push("Email already exist");
                res.render("users/registration", {
                    messages: errors
                });
            }
        })
        .catch(err=>console.log(`Error: ${err}`));

    if (emailRegexp.test(newUser.email) == false) {
        errors.push("Please enter a valid email");
    }

    if (newUser.fName.trim() == '') {
        errors.push("Please enter a valid first name");
    }

    if (newUser.lName.trim() == '') {
        errors.push("Please enter a valid last name");
    }

    if (newUser.password != req.body.psw2) {
        errors.push("Please make sure your passwords match");
    }

    if (passwordRegexp.test(newUser.password) == false) {
        errors.push("Please enter a valid password");
    }

    // There are erros during validation
    if (errors.length > 0) {
        res.render("users/registration", {
            messages: errors
        });
    }

    // Validation is OK
    else {
        const t = new User(newUser);
        t.save()
            .then(() => {
                console.log(`User was added to the database`);

                // Sendgrid - Confirmation email
                const nodemailer = require("nodemailer");
                const sgTransport = require("nodemailer-sendgrid-transport");

                let options = {
                    auth: {
                        api_key: process.env.sendgridKey
                    }
                }

                let mailer = nodemailer.createTransport(sgTransport(options));

                let email = {
                    to: `${req.body.email}`,
                    from: "medeiros.ricardo@outlook.com",
                    subject: "Account Created",
                    text: `${req.body.fName} ${req.body.lName}, your account was successfully created.`
                };

                mailer.sendMail(email, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(res);
                    }
                });

                res.redirect("/user/dashboard");
            })
            .catch(err => console.log(`Error: ${err}`));
    }
});

// Route to user login
router.get("/login", (req, res) => {
    res.render("users/login");
});

// User login form process
router.post("/login", (req, res) => {

    const errors = [];

    const formData = {
        email: req.body.email,
        password: req.body.psw
    }

    if (formData.email.trim() == '') {
        errors.push("Please enter a email");
    }

    if (formData.password.trim() == '') {
        errors.push("Please enter a password");
    }

    // There are errors during validation
    if (errors.length > 0) {
        res.render("users/login", {
            messages: errors
        });
    }

    // Validation is OK
    else {
        User.findOne({ email: formData.email })
            .then(t => {

                // If email does not exist, not a user
                if (t == null) {
                    errors.push("Sorry, you entered the wrong username and/or password");
                    res.render("users/login", {
                        messages: errors
                    });
                }

                // Email exist
                else {
                    bcrypt.compare(formData.password, t.password)
                        .then(isMatched => {

                            // Password is correct
                            if (isMatched == true) {
                                req.session.userInfo = t;

                                // User login
                                if (t.userType == "User") {
                                    res.redirect("/user/dashboard");
                                } else {
                                    req.session.adminInfo = t;
                                    res.redirect("/user/admin");
                                }
                            }

                            // Password is wrong
                            else {
                                errors.push("Sorry, you entered the wrong username and/or password");
                                res.render("users/login", {
                                    messages: errors
                                });
                            }
                        })
                        .catch(err => console.log(`Error: ${err}`));
                }
            });
    }
});

module.exports = router;
