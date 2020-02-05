const Sequelize = require("sequelize");
const db = require("../db");
const User = require("./model");
const question_answer = require("../question_answer/model");

const UserQuestion = db.define('userquestionmodel')

question_answer.belongsToMany(User, {
  through: UserQuestion,
  allowNull: true
});
User.belongsToMany(question_answer, {
  through: UserQuestion,
  allowNull: true

});

module.exports=UserQuestion

