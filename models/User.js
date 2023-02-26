// It is a modal so first name should be capital
// This is for the user who will log in the app
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Making a unique email so that no two user can have same email
// So we are creating Indexes
// But we can also use findbyId or findbyName method as we do in auth.js
const User = mongoose.model("user", userSchema);
// User.createIndexes();
module.exports = User;
