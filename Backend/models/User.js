// Import the mongoose library to define schema and model.
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for the User model.
const UserSchema = new Schema({
    // User's name
    name: {
        type: String,
        required: true,
    },

    // User's email (must be unique)
    email: {
        type: String,
        required: true,
        unique: true,
    },

    // Hashed password
    password: {
        type: String,
        required: true,
    },

    // Timestamp for user creation
    createdAt: {
        type: Date,
        default: Date.now,
    },

    // Timestamp for user last update
    updatedAt: {
        type: Date,
        default: Date.now,
    },

    // Timestamp for soft deletion (null if not deleted)
    deletedAt: {
        type: Date,
        default: null,
    },

    // OTP for password reset
    otp: {
        type: String,
        default: null,
    },

    // OTP expiry time
    otpExpiry: {
        type: Date,
        default: null,
    },

    // Flag to indicate if OTP has been successfully verified
    otpVerified: {
        type: Boolean,
        default: false,
    },
});

// Optionally, you can add a pre-save hook to update `updatedAt` automatically
UserSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Create the model from the schema
const User = mongoose.model('User', UserSchema);

// Export the model
module.exports = User;
