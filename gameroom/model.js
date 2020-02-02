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

  },
  {
    timestamps: false
  }
);
question_answer.belongsTo(Gameroom)
Gameroom.hasMany(question_answer)


module.exports = Gameroom;
