const Sequelize = require("sequelize")
const db = require("../db")


const question_answer = db.define("question",{

question:{
    type: Sequelize.STRING,
    allowNull: false
},
answer:{
    type:Sequelize.STRING,
    allowNull:false
},
answeredCorrect:{
    type:Sequelize.BOOLEAN,
    allowNull:true
},
answeredWrong:{
    type:Sequelize.BOOLEAN,
    allowNull:true
}

})



module.exports = question_answer