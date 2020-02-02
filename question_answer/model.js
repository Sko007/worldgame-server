const Sequelize = require("sequelize")
const db = require("../db")
const Gameroom = require ("../gameroom/model")
const User = require("../user/model")


const question_answer = db.define("question",{

question:{
    type: Sequelize.STRING,
    allowNull: false
},
answer:{
    type:Sequelize.STRING,
    allowNull:false
}

})


module.exports = question_answer