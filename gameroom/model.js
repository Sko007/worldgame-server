const Sequelize = require("sequelize");
const sequelize = require("../db");
const User = require("../user/model");
const question_answer = require("../question_answer/model");

const Gameroom = sequelize.define(
  "gameroom",
  {
    name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    turn: {
      type: Sequelize.INTEGER,
      allowNull: true
    },

  //   questionId: {
  //       type: Sequelize.INTEGER,
  //       references: {
  //           model: question_answer,
  //           key: 'id'        
  //       }
  // }
  },
  {
    timestamps: false
  }
);


module.exports = Gameroom;
