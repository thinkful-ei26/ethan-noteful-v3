'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Tag = require('../models/tag');
const Note = require('../models/note');


const router = express.Router();

// GET ALL TAGS
router.get('/', (req, res, next) => {
  Tag.find({}).sort({name: 'asc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

// GET TAGS BY ID
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Tag.findById(id)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

// CREATE A NEW TAG
router.post('/', (req, res, next) => {
  const { name } = req.body;
  const newTag = { name };
  
  if (!newTag.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  
  Tag.create(newTag)
    .then((result) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});


// UPDATE A TAG
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { name } = req.body;
  const updateTag = { name };
   
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  if (!updateTag.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  
  Tag.findByIdAndUpdate(id, updateTag, {new: true})
    .then(results => {
      if (results){
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The tag name already exists');
        err.status = 400;
      }
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

// DELETE A TAG
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Tag.findByIdAndRemove(id)
    .then(() => {
      return Note
        .updateMany(
          {tags: id},
          { $pull: { tags: id } }
        );
    })
    .then(() => res.sendStatus(204))
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
}); 


module.exports = router;