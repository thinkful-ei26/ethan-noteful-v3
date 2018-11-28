'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

before(function () {
  return mongoose.connect(TEST_MONGODB_URI)
    .then(() => mongoose.connection.db.dropDatabase());
});

beforeEach(function () {
  return Note.insertMany(notes);
});

afterEach(function () {
  return mongoose.connection.db.dropDatabase();
});

after(function () {
  return mongoose.disconnect();
});

describe('POST /api/notes', function () {
  it('should create and return a new item when provided valid data', function () {
    const newItem = {
      'title': 'The best article about cats ever!',
      'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
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
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
        return Note.findById(res.body.id);
      })
      .then(data => {
        // console.log(data);
        expect(res.body.id).to.equal(data.id);
        expect(res.body.title).to.equal(data.title);
        expect(res.body.content).to.equal(data.content);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
      });
  });
});

describe('PUT /api/notes/:id', function (){
  it('should update and return the correct note', function (){
    const updateItem = {
      'title': 'newwww',
      'content': 'also new',
      'id': '000000000000000000000003'
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
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
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
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
        expect(res.body.id).to.equal(data.id);
        expect(res.body.title).to.equal(data.title);
        expect(res.body.content).to.equal(data.content);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
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
        expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
        expect(res.body.id).to.equal(data.id);
        expect(res.body.title).to.equal(data.title);
        expect(res.body.content).to.equal(data.content);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
      });
  });
});