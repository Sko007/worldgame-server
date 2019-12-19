const Sequelize = require('sequelize')
const sequelize = require('../db')
const Gameroom = require("../gameroom/model")

const User = sequelize.define('user', {
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },

}, {
  timestamps: false,
  tableName: 'users'
})


User.belongsTo(Gameroom)
Gameroom.hasMany(User)

module.exports = User