const Sequelize = require('sequelize')
const sequelize = require('../db')

const Gameroom = sequelize.define('gameroom', {

    name:Sequelize.STRING
})

module.exports = Gameroom