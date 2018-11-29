'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');

const { notes, folders } = require('../db/seed/data');

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Folder.createIndexes(),
    ]);
  })
  .then(results => {
    // console.info(results);
    console.info(`Inserted ${results[0].length} notes`);
    console.info(`Inserted ${results[1].length} folders`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });