'use strict';

const express = require('express');

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  let filter = {};
  if (searchTerm) {
    filter.title = { $regex: searchTerm, $options: 'i'};
  }
  Note.find(filter).sort({updatedAt: 'desc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  Note.findById(id)
    .then(results => {
      res.json(results);
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
  const { title, content } = req.body;
  const newNote = {
    title: title,
    content: content
  };
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  Note.create({
    title: newNote.title,
    content: newNote.content
  })
    .then((result) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { title, content } = req.body;
  const updateNote = {
    title: title,
    content: content
  };
  Note.findByIdAndUpdate(id, { $set: {title: updateNote.title, content: updateNote.content} }, {new: true})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});
// console.log('Update a Note');
// res.json({ id: 1, title: 'Updated Temp 1' });


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const deleteId = req.params.id;
  Note.findByIdAndRemove(deleteId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});
// console.log('Delete a Note');
// res.status(204).end();

module.exports = router;