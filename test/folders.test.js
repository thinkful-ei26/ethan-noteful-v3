'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');

const { folders, notes } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

before(function () {
  return mongoose.connect(TEST_MONGODB_URI)
    .then(() => mongoose.connection.db.dropDatabase());
});

beforeEach(function () {
  return Folder.insertMany(folders);
});

afterEach(function () {
  return mongoose.connection.db.dropDatabase();
});

after(function () {
  return mongoose.disconnect();
});


describe('POST /api/folders', function () {
  
  it('should create and return a new folder when provided valid data', function () {
    const newFolder = {'name': 'CATS!'};

    let res;
    return chai.request(app)
      .post('/api/folders')
      .send(newFolder)
      .then(function (_res) {
        res = _res;
        expect(res).to.have.status(201);
        expect(res).to.have.header('location');
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
        return Folder.findById(res.body.id);
      })
      .then(data => {
        // console.log(data);
        expect(res.body.id).to.equal(data.id);
        expect(res.body.name).to.equal(data.name);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
      });
  });

  it('should throw an error when given a folder without a title', function () {
    const newFolder = {
      'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
    };

    let res;
    return chai.request(app)
      .post('/api/folders')
      .send(newFolder)
      .then(function (_res) {
        res = _res;
        expect(res).to.have.status(400);
        // console.log(res.error);
        expect(res.error.text).to.equal('{"status":400,"message":"Missing `title` in request body"}');
      });
  });
});
