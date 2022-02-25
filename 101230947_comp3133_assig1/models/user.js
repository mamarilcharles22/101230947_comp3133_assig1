// Load modules
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

// Create user schema
const userSchema = new Schema({

    email: {
        type: String,
        required: true
    },

    fName: {
        type: String,
        required: true
    },

    lName: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    userType: {
        type: String,
        default: "User"
    },

    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

// Pre save mongoose for password encryption
userSchema.pre("save",function(next) {
    bcrypt.genSalt(10)
        .then(salt => {
            bcrypt.hash(this.password,salt)
                .then(hash => {
                    this.password = hash;
                    next();
                })
                .catch(err=>console.log(`Error: ${err}`));
        })
        .catch(err=>console.log(`Error: ${err}`));
});

const userModel = mongoose.model("User",userSchema);

module.exports = userModel;
