const express = require("express");
const router = express.Router();
const Note = require("../models/Notes");
const fetchUser = require("../middleware/fetchUser");

// GET notes for the logged-in user only
router.get("/", fetchUser, async (req, res) => {
  try {
    // Fetch notes where user matches the logged-in user's id
    const notes = await Note.find({ user: req.user.id });
    res.status(200).json({
      message: "Notes fetched successfully",
      status: "success",
      data: notes,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error: error.message });
  }
});

// POST a new note for the logged-in user
router.post("/", fetchUser, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const note = new Note({ title, description, tags, user: req.user.id });
    await note.save();
    console.log("Note saved to MongoDB:", note);
    res.status(201).json({
      message: "Note created successfully",
      status: "success",
      data: note,
    });
  } catch (error) {
    res.status(400).json({ message: "Error creating note", error: error.message });
  }
});

// PUT /api/notes/updatenote/:id - Update a note by ID for the logged-in user
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    // Find the note and ensure it belongs to the logged-in user
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not allowed to update this note" });
    }
    note.title = title;
    note.description = description;
    note.tags = tags;
    await note.save();
    console.log("Note updated in MongoDB:", note);
    res.status(200).json({
      message: "Note updated successfully",
      status: "success",
      data: note,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Error updating note", error: error.message });
  }
});

// DELETE /api/notes/deletenote/:id - Delete a note by ID for the logged-in user
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    if (note.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Not allowed to delete this note" });
    }
    await note.deleteOne();
    console.log("Note deleted from MongoDB:", note);
    res.status(200).json({
      message: "Note deleted successfully",
      status: "success",
      data: note,
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Error deleting note", error: error.message });
  }
});

module.exports = router;
