const express = require('express');
const router = express.Router();
const connectToDB = require('../db');
const { ObjectId } = require('mongodb');
const logger = require("../logger")
// Placeholder for the database object
let db;

// Initialize database connection
(async () => {
  db = await connectToDB();
})();

// Create a note
router.post('/', async (req, res) => {
  try {
    logger.info('Create Note Request Received', { body: req.body });
    const note = {
      title: req.body.title,
      content: req.body.content,
      createdAt: new Date(),
    };
    const result = await db.collection('notes').insertOne(note);
    logger.info('Note Created Successfully', { noteId: result.insertedId });
    res.status(201).json(result.ops[0]); // Return the created note
  } catch (error) {
    logger.error('Error Creating Note', { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
});

// Get all notes
router.get('/', async (req, res) => {
  try {
    logger.info('Get All Notes Request Received');
    const notes = await db.collection('notes').find().toArray();
    logger.info('Notes Retrieved Successfully', { notesCount: notes.length });
    res.json(notes);
  } catch (error) {
    logger.error('Error Retrieving Notes', { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
});

// Update a note

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('Update Note Request Received', { noteId: id, body: req.body });

    // Ensure the provided ID is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      logger.warn('Invalid ObjectId', { noteId: id });
      return res.status(400).json({ message: "Invalid ObjectId" });
    }

    // Prepare the updated note data
    const updatedNote = {
      $set: {
        title: req.body.title,
        content: req.body.content,
        updatedAt: new Date(),
      },
    };

    // Perform the update
    const result = await db.collection('notes').updateOne({ _id: new ObjectId(id) }, updatedNote);

    // Check if any document was matched and updated
    if (result.matchedCount === 0) {
      logger.warn('Note Not Found for Update', { noteId: id });
      return res.status(404).json({ message: "Note not found" });
    }

    if (result.modifiedCount === 0) {
      logger.warn('No Changes Made to Note', { noteId: id });
      return res.status(400).json({ message: "No changes made to the note" });
    }

    // Successfully updated
    logger.info('Note Updated Successfully', { noteId: id });
    res.json({ message: "Note updated successfully", result });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Error updating note", error: error.message });
  }
});

// Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info('Delete Note Request Received', { noteId: id });
    // Ensure that the provided id is a valid ObjectId
    if (!ObjectId.isValid(id)) {
      logger.warn('Invalid ObjectId', { noteId: id });
      return res.status(400).json({ message: "Invalid ObjectId" });
    }

    const result = await db.collection('notes').deleteOne({ _id: new ObjectId(id) });

    // Check if a document was deleted
    if (result.deletedCount === 0) {
      logger.warn('Note Not Found for Deletion', { noteId: id });
      return res.status(404).json({ message: "Note not found" });
    }

    //console.log(result);
    logger.info('Note Deleted Successfully', { noteId: id });
    res.json({ message: 'Note deleted', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
