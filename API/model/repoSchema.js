const mongoose = require('mongoose')
const validator = require('validator')

const repoSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  login: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    validate: {
      validator: (v) => {
        validator.isURL(v)
      },
      message: 'Неверный формат ссылки',
    },
  },
  ownerUrl: {
    type: String,
    required: true,
    validate: {
      validator: (v) => {
        validator.isURL(v)
      },
      message: 'Неверный формат ссылки',
    },
  },
  repoUrl: {
    type: String,
    required: true,
    validate: {
      validator: (v) => {
        validator.isURL(v)
      },
      message: 'Неверный формат ссылки',
    },
  },
  description:{
    type: String,
  },
  stargazers_count: {
    type: Number,
    required: true,
  },
  daily_stars: { 
    type: Number, 
    default: 0 
  },
  last_synced : {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('repository', repoSchema)