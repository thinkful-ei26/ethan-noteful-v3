'use strict';

const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/user');

const localStrategy = new LocalStrategy((username, password, done) => {
  


})