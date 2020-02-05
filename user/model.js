const Sequelize = require('sequelize')
const db = require('../db')
const Gameroom = require("../gameroom/model")

const User = db.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  score:{
      type: Sequelize.INTEGER,
      default: 0
  },
  ready:{
    type:Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull:true
  },
  startGame:{
    type:Sequelize.BOOLEAN,
    allowNull:true
  },
  answerGiven:{
    type:Sequelize.BOOLEAN,
    defaultValue:false,
    allowNull:true
  },
  wait:{
    type:Sequelize.BOOLEAN,
    allowNull:true
  },
  questionAsk:{
    type:Sequelize.ARRAY(Sequelize.INTEGER),
    allowNull:true
  }

}, {
  timestamps: false,
})

User.belongsTo(Gameroom)
Gameroom.hasMany(User)






module.exports = User