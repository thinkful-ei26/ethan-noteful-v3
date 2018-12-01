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


describe('Noteful API - Folders', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      Folder.insertMany(folders),
      Folder.createIndexes()
    ]);
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

    it('should throw an error when given a folder without a name', function () {
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
          expect(res.body).to.be.a('object');
          expect(res.error.text).to.equal('{"status":400,"message":"Missing `name` in request body"}');
        });
    });
    
    it('should throw an error when given a duplicate name', function () {
      return Folder.findOne()
        .then(data => {
          const newItem = { 'name': data.name };
          return chai.request(app).post('/api/folders').send(newItem);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.error.text).to.equal('{"status":400,"message":"The folder name already exists"}');
        });
    });
  });

  describe('PUT update folders', function () {
    
    it('should update and return a new folder when provided valid data', function () {
      // const updateFolder = {'name': 'CATS!'};
      const updateFolder = { 'name': 'CATS!' };
      return Folder.findOne()
        .then(data => {
          // const newItem = { 'name': data.name };
          updateFolder.id = data.id;
          // console.log(updateFolder);
          return chai.request(app).put(`/api/folders/${data.id}`).send(updateFolder);
        })
        .then(res => {
          // console.log(res.body);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(updateFolder.id);
          expect(res.body.name).to.equal(updateFolder.name);
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

  describe('DELETE /api/folders/:id', function () {

    it('should delete an existing document and respond with 204', function () {
      let data;
      return Folder.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).delete(`/api/folders/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
          expect(res.body).to.be.empty;
          return Folder.countDocuments({ _id: data.id });
        })
        .then(count => {
          expect(count).to.equal(0);
        });
    });
  });

});