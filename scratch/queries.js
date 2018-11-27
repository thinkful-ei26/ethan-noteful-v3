'use strict';


const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

// mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
//   .then(() => {
//     const searchTerm = 'lady gaga';
//     let filter = {};

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm, $options: 'i'};
//     }
//     return Note.find(filter).sort({updatedAt: 'desc'});
//   })
//   .then(results => {
//     console.log(results);
//   })
//   .then(() => {
//     return mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error(`ERROR: ${err.message}`);
//     console.error(err);
//   });


mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    const testId = '00000000000000000000000';
    return Note.findById(testId);
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

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    const updateNote = {
      _id: '000000000000000000000000',
      title: 'foo',
      content: 'bar'
    };

    Note.findByIdAndUpdate(updateNote._id, { $set: {title: updateNote.title, content: updateNote.content} })
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

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    const deleteId = '000000000000000000000002';
    
    Note.findByIdAndRemove(deleteId)
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