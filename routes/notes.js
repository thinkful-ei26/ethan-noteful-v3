'use strict';

const express = require('express');

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      const searchTerm = req.query.searchTerm;
      let filter = {};
      if (searchTerm) {
        filter.title = { $regex: searchTerm, $options: 'i'};
      }
      return Note.find(filter).sort({updatedAt: 'desc'});
    })
    .then(results => {
      res.json(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      const id = req.params.id;
      return Note.findById(id);
    })
    .then(results => {
      res.json(results);
    })
    .then(() => {
      return mongoose.disconnect();
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
  // console.log('Get a Note');
  // res.json({ id: 1, title: 'Temp 1' });

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(() => {
      const newNote = {
        title: 'test',
        content: 'words'
      };
      Note.create({
        title: newNote.title,
        content: newNote.content
      })
        .then(results => {
          console.log(results);
        })
        .then(() => {
          return mongoose.disconnect();
        })
        .catch(err => {
          console.error(`ERROR: ${err.message}`);
          console.error(err);
        });
    });
  console.log('Create a Note');
  res.location('path/to/new/document').status(201).json({ id: 2, title: 'Temp 2' });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({ id: 1, title: 'Updated Temp 1' });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();
});

module.exports = router;