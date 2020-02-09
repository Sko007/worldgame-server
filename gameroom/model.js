const Sequelize = require("sequelize");
const sequelize = require("../db");
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
    gameStarted:{
      type: Sequelize.BOOLEAN,
      allowNull:true,
      defaultValue:false
    },
    gameFinished:{
      type:Sequelize.BOOLEAN,
      allowNull:true,
      defaultValue:false
    }

  },
  {
    timestamps: false
  }
);
question_answer.belongsTo(Gameroom)
Gameroom.hasMany(question_answer)


module.exports = Gameroom;
