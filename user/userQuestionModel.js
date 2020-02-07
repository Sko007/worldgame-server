const Sequelize = require("sequelize");
const db = require("../db");
const User = require("./model");
const question_answer = require("../question_answer/model");

const UserQuestion = db.define('userquestionmodel',{

    answerCorrect:{
        type:Sequelize.BOOLEAN,
        allowNull:true
    },
    answerWrong:{
        type:Sequelize.BOOLEAN,
        allowNull:true
    }
})

question_answer.belongsToMany(User, {

  through: UserQuestion,
  allowNull: true
});
User.belongsToMany(question_answer, {
  through: UserQuestion,
  allowNull: true

});

module.exports=UserQuestion

