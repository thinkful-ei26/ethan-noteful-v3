'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Note = require('../models/note');
// const Tag = require('../models/tag');

const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  const selectedFolderId = req.query.folderId;
  const tagId = req.query.tagId;
  let filter = {};
  
  if (selectedFolderId) {
    filter.folderId = selectedFolderId;
  }

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }
  // if (searchTerm) {
  //   filter.title = { $regex: searchTerm, $options: 'i'};
  // }

  if(tagId) {
    filter.tags = tagId; 
  }

  // console.log(filter);
  
  Note.find(filter).sort({updatedAt: 'desc'})
    .populate('tags')  
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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Note.findById(id)
    .populate('tags')  
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
  // const folderId = req.query.folderId;
  const { title, content, folderId, tags } = req.body;
  const newNote = { title, content, tags, folderId };
  
  if (!newNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId){
    newNote.folderId = folderId;
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The folder `id` is not valid');
    err.status = 400;
    return next(err);
  }

  tags.forEach(tagId => {
    if (!mongoose.Types.ObjectId.isValid(tagId)) {
      const err = new Error('A tag `id` is not valid');
      err.status = 400;
      return next(err);
    }
  });

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
  // const folderId = req.query.folderId;
  const id = req.params.id;
  const { title, content, folderId, tags } = req.body;
  const updateNote = { title, content, folderId, tags };
  
  if (!updateNote.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The folder `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  if (folderId){
    updateNote.folderId = folderId;
  }
  
  tags.forEach(tagId => {
    if (!mongoose.Types.ObjectId.isValid(tagId)) {
      const err = new Error('A tag `id` is not valid');
      err.status = 400;
      return next(err);
    }
  });
  
  // Note.findByIdAndUpdate(id, { $set: {title: updateNote.title, content: updateNote.content} }, {new: true})
  Note.findByIdAndUpdate(id, updateNote, {new: true})
    .then(results => {
      if (results){
        res.status(200).json(results);
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
  const id = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Note.findByIdAndRemove(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

module.exports = router;