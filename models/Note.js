// It is a modal so first name should be capital
// This is for the notes to be entered by the user
const mongoose = require("mongoose");
const { Schema } = mongoose;

// We need to asscociate the notes with the user somehow
// So that we can show only notes of a user to that user only

const NotesSchema = new mongoose.Schema({
  user: {
    // It is like a foreign key
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "General",
  },
  tag: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("notes", NotesSchema);
