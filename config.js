'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://dev:devdev1@ds129966.mlab.com:29966/noteful',
  TEST_MONGODB_URI: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/noteful-test'
};