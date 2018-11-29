'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Note = require('../models/note');


const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  const folderId = req.query.folderId;
  let filter = {};
  
  if (folderId) {
    filter.folderId =  folderId;
  }

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }
  // if (searchTerm) {
  //   filter.title = { $regex: searchTerm, $options: 'i'};
  // }
  
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
  const folderId = req.query.folderId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Note.findById(id)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const folderId = req.query.folderId;
  const { title, content } = req.body;
  const newNote = {
    title, content
    // title: title,
    // content: content
  };
  
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  
  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The folder `id` is not valid');
    err.status = 400;
    return next(err);
  }

  // Note.create({
  //   title: newNote.title,
  //   content: newNote.content
  // })
  Note.create(newNote)
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
  const folderId = req.query.folderId;
  const id = req.params.id;
  const { title, content } = req.body;
  const updateNote = {
    title: title,
    content: content
  };
  
  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The folder `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  if (!updateNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  
  // Note.findByIdAndUpdate(id, { $set: {title: updateNote.title, content: updateNote.content} }, {new: true})
  Note.findByIdAndUpdate(id, updateNote, {new: true})
    .then(results => {
      if (results){
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const deleteId = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(deleteId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Note.findByIdAndRemove(deleteId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

module.exports = router;