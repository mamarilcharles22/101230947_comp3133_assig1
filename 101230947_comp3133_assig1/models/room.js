const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create room schema
const roomSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    photo: {
        type: String,
    },

    dateCreated: {
        type: Date,
        default: Date.now()
    }
});

const roomModel = mongoose.model("Room",roomSchema);

module.exports = roomModel;
