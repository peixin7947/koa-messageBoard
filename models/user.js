'use strict';
const mongoose = require('mongoose');

const schema = mongoose.Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  nickname: {
    type: String
  },
  createTime: { type: Date, default: Date.now },
  email: {
    type: String,
    default: ''
  },
  sex: {
    type: Number
  },
  avatar: {
    type: String,
    default: '/static/images/avatar.png'
  },
  intro: {
    type: String,
    default: ''
  },
  age: { type: Number, min: 0, max: 120 }
});
const User = mongoose.model('User', schema, 'User');
module.exports = User;
