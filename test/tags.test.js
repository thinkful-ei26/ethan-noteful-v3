'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');


const { folders, notes, tags } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Noteful API - Folders', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      Tag.insertMany(tags),
      Tag.createIndexes()
    ]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });


  describe('GET /api/tags', function () {

    it('should return a list sorted by name with the correct number of tags', function () {
      return Promise.all([
        Tag.find().sort('name'),
        chai.request(app).get('/api/tags')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    // it('should return a list with the correct fields and values', function () {
    //   return Promise.all([
    //     Tag.find().sort('name'),
    //     chai.request(app).get('/api/tags')
    //   ])
    //     .then(([data, res]) => {
    //       expect(res).to.have.status(200);
    //       expect(res).to.be.json;
    //       expect(res.body).to.be.a('array');
    //       expect(res.body).to.have.length(data.length);
    //       res.body.forEach(function (item, i) {
    //         expect(item).to.be.a('object');
    //         expect(item).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
    //         expect(item.id).to.equal(data[i].id);
    //         expect(item.name).to.equal(data[i].name);
    //         expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
    //         expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
    //       });
    //     });
    // });

  });

  describe('GET /api/tags/:id', function () {

    it('should return correct tag', function () {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/tags/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.deep.equal(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.deep.equal(data.updatedAt);
        });
    });

    it('should respond with a 400 for an invalid id', function () {
      return chai.request(app)
        .get('/api/tags/NOT-A-VALID-ID')
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an ID that does not exist', function () {
      // The string "DOESNOTEXIST" is 12 bytes which is a valid Mongo ObjectId
      return chai.request(app)
        .get('/api/tags/twelvetwelve')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });

  describe('POST /api/tags', function () {
  
    it('should create and return a new tag when provided valid data', function () {
      const newTag = {'name': 'CATS!'};

      let res;
      return chai.request(app)
        .post('/api/tags')
        .send(newTag)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          return Tag.findById(res.body.id);
        })
        .then(data => {
        // console.log(data);
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should throw an error when given a folder without a name', function () {
      const newTag = {
        'content': 'NOT A NAME'
      };

      let res;
      return chai.request(app)
        .post('/api/folders')
        .send(newTag)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(400);
          // console.log(res.error);
          expect(res.body).to.be.a('object');
          expect(res.error.text).to.equal('{"status":400,"message":"Missing `name` in request body"}');
        });
    });
    
    it('should throw an error when given a duplicate name', function () {
      return Tag.findOne()
        .then(data => {
          const newItem = { 'name': data.name };
          return chai.request(app).post('/api/tags').send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.error.text).to.equal('{"status":400,"message":"The tag name already exists"}');
        });
    });
  });

  describe('PUT update tags', function () {
    
    it('should update and return a new tag when provided valid data', function () {
      // const updateFolder = {'name': 'CATS!'};
      const updateTag = { 'name': 'CATS!' };
      return Tag.findOne()
        .then(data => {
          // const newItem = { 'name': data.name };
          updateTag.id = data.id;
          // console.log(updateFolder);
          return chai.request(app).put(`/api/tags/${data.id}`).send(updateTag);
        })
        .then(res => {
          // console.log(res.body);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(updateTag.id);
          expect(res.body.name).to.equal(updateTag.name);
        });
    });

    // it('should throw an error when given a duplicate name', function () {
    //   const newItem = {};
    //   return Folder.findOne()
    //     .then(data => {
    //       newItem.name = data.name;
    //       newItem.id = data.id;
    //       return chai.request(app).put(`/api/folders/${data.id}`).send(newItem);
    //     })
    //     .then(res => {
    //       expect(res).to.have.status(400);
    //       expect(res).to.be.json;
    //       expect(res.body).to.be.a('object');
    //       expect(res.error.text).to.equal('{"status":400,"message":"The folder name already exists"}');
    //     });

    // });
  });

  describe('DELETE /api/tags/:id', function () {

    it('should delete an existing document and respond with 204', function () {
      let data;
      return Tag.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/tags/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Tag.countDocuments({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });
  });

});