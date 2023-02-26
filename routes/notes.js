const express = require("express");
const router = express.Router();
const Note = require("../models/Note");
const fetchuser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");

// Route 1: Fetch all notes of a user using: GET "/api/notes/fetchallnotes"
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (err) {
    // catch the error if there
    console.log(err.message);
    // return server error status code
    res.status(500).send("Some error occured");
  }
});

// Route 2: Add a new note using: POST "/api/notes/addnote" . Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid Title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();
      res.json(savedNote);
    } catch (err) {
      // catch the error if there
      console.log(err.message);
      // return server error status code
      res.status(500).send("Some error occured");
    }
  }
);

// Route 3: Update an Existing note using: PUT "/api/notes/updatenote/:id" . Login required
// We will use PUT request to update the note
// we need to give id of a note to update a specific note
// We need only the Autheticated user to update the note
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    // Create a new note object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }
    // Check whether the user is original or its someone else
    // Find the note to be updated and update it
    // req.params.id gives us the id we sent in the endpoint
    let note = await Note.findById(req.params.id);
    // If Note with such id does not exists
    if (!note) {
      return res.status(404).send("Not Found");
    }
    // If user is not original
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    // Now means Note exists and user is also original so we can give access of updating the note to the user

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (err) {
    // catch the error if there
    console.log(err.message);
    // return server error status code
    res.status(500).send("Some error occured");
  }
});

// Route 4: Deleting an Existing note using: DELETE "/api/notes/deletenote/:id" . Login required
// We will use DELETE request to update the note
// we need to give id of a note to delete a specific note
// We need only the Autheticated user to delete the note
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    // Check whether the user is original or its someone else
    // Find the note to be deleted and delete it
    // req.params.id gives us the id we sent in the endpoint
    let note = await Note.findById(req.params.id);
    // If Note with such id does not exists
    if (!note) {
      return res.status(404).send("Not Found");
    }
    // If user is not original then you cannot delete the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    // Now means Note exists and user is also original so we can give access of updating the note to the user

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been Deleted", note: note });
  } catch (err) {
    // catch the error if there
    console.log(err.message);
    // return server error status code
    res.status(500).send("Some error occured");
  }
});

module.exports = router;
