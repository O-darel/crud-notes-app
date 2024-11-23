const express = require('express');
const router = express.Router();
const connectToDB = require('../db');
const { ObjectId } = require('mongodb');

// Placeholder for the database object
let db;

// Initialize database connection
(async () => {
    db = await connectToDB();
})();

// Create a note
router.post('/', async (req, res) => {
    try {
        const note = {
            title: req.body.title,
            content: req.body.content,
            createdAt: new Date(),
        };
        const result = await db.collection('notes').insertOne(note);
        res.status(201).json(result.ops[0]); // Return the created note
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all notes
router.get('/', async (req, res) => {
    try {
        const notes = await db.collection('notes').find().toArray();
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a note

router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Ensure the provided ID is a valid ObjectId
      if (!ObjectId.isValid(id)) {
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
        return res.status(404).json({ message: "Note not found" });
      }
  
      if (result.modifiedCount === 0) {
        return res.status(400).json({ message: "No changes made to the note" });
      }
  
      // Successfully updated
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
        // Ensure that the provided id is a valid ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid ObjectId" });
        }

        const result = await db.collection('notes').deleteOne({ _id: new ObjectId(id) });

        // Check if a document was deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Note not found" });
        }

        //console.log(result);
        res.json({ message: 'Note deleted', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
