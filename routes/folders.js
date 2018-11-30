'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Folder = require('../models/folder');
const Note = require('../models/note');


const router = express.Router();



// GET ALL FOLDERS
router.get('/', (req, res, next) => {
  Folder.find({}).sort({name: 'asc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

//GET FOLDER BY ID

router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Folder.findById(id)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

// CREATE A NEW FOLDER
router.post('/', (req, res, next) => {
  const { name } = req.body;
  const newFolder = { name };
  
  if (!newFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  
  Folder.create(newFolder)
    .then((result) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});

// UPDATE A FOLDER
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { name } = req.body;
  const updateFolder = { name };
   
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  if (!updateFolder.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  
  Folder.findByIdAndUpdate(id, updateFolder, {new: true})
    .then(results => {
      if (results){
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The folder name already exists');
        err.status = 400;
      }
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
});


router.delete('/:id', (req, res, next) => {
  const deleteId = req.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(deleteId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Folder.findByIdAndRemove(deleteId)
    .then(() => {
      return Note
        .deleteMany({folderId: deleteId});
    })
    .then(() => res.sendStatus(204))
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      next(err);
    });
    
  // const folderRemovePromise = Folder.findByIdAndRemove( deleteId );

  // const noteRemovePromise = Note.deleteMany({ folderId: deleteId });

  // Promise.all([folderRemovePromise, noteRemovePromise])
  //   .then(() => {
  //     res.status(204).end();
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});

module.exports = router;