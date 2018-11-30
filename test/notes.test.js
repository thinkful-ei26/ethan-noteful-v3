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


describe('Noteful API - Notes', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Tag.insertMany(tags)
    ])
      .then(() => {
        return Note.createIndexes();
      });
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });


  describe('GET /api/notes', function () {
  
    it('should return all notes', function() {
      return Promise.all([
        Note.find(),
        chai.request(app).get('/api/notes')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  
    // it('should return correct notes for a search term', function(){
    //   let searchTerm = 'Gaga';
    //   let filter = {};
    //   if (searchTerm) {
    //     filter.title = { $regex: searchTerm, $options: 'i'};
    //   }
    //   return Note.find(filter)
    //     .then(() => {
    //       return chai.request(app).get(`/api/notes/?searchTerm=${searchTerm}`);
    //     })
    //     .then((res) => {
    //       expect(res).to.have.status(200);
    //       expect(res).to.be.json;
    //       expect(res.body).to.be.an('array');
    //       expect(res.body[0]).to.have.keys('id', 'title', 'content', 'folderId', 'createdAt', 'updatedAt');
    //       // console.log(res.body[0]);
    //       // expect(res.body[0].id).to.equal(data.id);
    //       expect(res.body[0].title).to.include(searchTerm);
    //     // expect(res.body[0].content).to.equal(data.content);
    //     });
    // });

    it('ALT should return correct search results for a searchTerm query', function () {
      const searchTerm = 'gaga';
      // const re = new RegExp(searchTerm, 'i');
      const dbPromise = Note.find({
        title: { $regex: searchTerm, $options: 'i' }
      // $or: [{ 'title': re }, { 'content': re }]
      });
      const apiPromise = chai.request(app)
        .get(`/api/notes?searchTerm=${searchTerm}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(1);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            expect(item).to.include.all.keys('id', 'title', 'tags', 'folderId', 'createdAt', 'updatedAt');
            expect(item.id).to.equal(data[i].id);
            expect(item.title).to.equal(data[i].title);
            expect(item.content).to.equal(data[i].content);
            // console.log(item.tags[0].id);
            // console.log(data[i].tags[0]);
            // expect(item.tags[0].id).to.equal(data[i].tags[0]);
            expect(new Date(item.createdAt)).to.deep.equal(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.deep.equal(data[i].updatedAt);
          });
        });
    });
  
    it('should return correct search results for a folderId query', function () {
      let data;
      return Folder.findOne()
        .then((_data) => {
          data = _data;
          return Promise.all([
            Note.find({ folderId: data.id }),
            chai.request(app).get(`/api/notes?folderId=${data.id}`)
          ]);
        })
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });


    it('should return an empty array for an incorrect query', function () {
      const searchTerm = 'NotValid';
      // const re = new RegExp(searchTerm, 'i');
      const dbPromise = Note.find({
        title: { $regex: searchTerm, $options: 'i' }
      // $or: [{ 'title': re }, { 'content': re }]
      });
      const apiPromise = chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`);
      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });
  });


  describe('GET /api/notes/:id', function (){
  
    it('should return correct note', function(){
      let data;
      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'tags', 'folderId', 'createdAt', 'updatedAt');
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return an error when `id` is not valid', function () {
      return chai.request(app)
        .get('/api/notes/NOT-A-VALID-ID')
        .then(res => {
        // console.log(res);
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
  });


  describe('POST /api/notes', function () {
  
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...', 
        'folderId': '111111111111111111111103',
        'tags': []
      };

      let res;
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'tags', 'folderId', 'createdAt', 'updatedAt');
          return Note.findById(res.body.id);
        })
        .then(data => {
        // console.log(data);
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          // expect(res.body.folderId).to.equal(data.folderId);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should throw an error when given an item without a title', function () {
      const newItem = {
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };

      let res;
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(400);
          // console.log(res.error);
          expect(res.error.text).to.equal('{"status":400,"message":"Missing `title` in request body"}');
        });
    });
  });


  describe('PUT /api/notes/:id', function (){
  
    it('should update and return the correct note', function (){
      const updateItem = {
        'title': 'newwww',
        'content': 'also new',
        'id': '000000000000000000000003',
        'tags': []
      };
      let res;
      return chai.request(app)
        .put(`/api/notes/${updateItem.id}`)
        .send(updateItem)
        .then(function (_res) {
          res = _res;
          // console.log(res);
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'tags', 'folderId', 'createdAt', 'updatedAt');
          return Note.findById(res.body.id);
        })
        .then(data => {
        // console.log(data);
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when id is not valid', function () {
    
      const updateItem = {
        'title': 'new',
        'content': 'CONTENT'
      };
      return chai.request(app)
        .put('/api/notes/NOT-A-VALID-ID')
        .send(updateItem)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.eq('The `id` is not valid');
        });
    });
  });


  describe('DELETE /api/notes/:id', function (){
  
    it('should delete the correct note', function (){
    // const deleteId = '000000000000000000000003';
      let data;
      return Note.findOne()
        .then(_data => {
          data =_data;
          return chai.request(app).delete(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(204);
          expect(res.body.length).to.equal(undefined);
        });
    });
  
    it('should return an error given an invalid id', function (){
      let id = 123;
      // let data;
      return Note.findOne()
        .then(() => {
        // data =_data;
          return chai.request(app).delete(`/api/notes/${id}`);
        })
        .then((res) => {
        // console.log(res);
          expect(res).to.have.status(400);
          expect(res.error).to.exist;
        });
    });
  });

});
