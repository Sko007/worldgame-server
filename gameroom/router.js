const { Router } = require("express");
const Gameroom = require("./model");
const auth = require("../auth/middleware");
const User = require("../user/model");
const Questions = require("../question_answer/model");
const { toData } = require("../auth/jwt");
const { Op } = require("sequelize");
const UserQuestion = require("../user/userQuestionModel");

function factory(stream) {
  const router = new Router();

  router.post("/gameroom", async (req, res, next) => {
    try {
      const gameroom = await Gameroom.create(req.body);

      const users = { users: [] };
      const questions = { questions: [] };

      const gameroomUser = { ...gameroom.dataValues, ...users, ...questions };

      const action = {
        type: "NEW_GAMEROOM",
        payload: gameroomUser
      };

      const string = JSON.stringify(action);

      stream.send(string);

      res.send(gameroom);
    } catch (error) {
      next(error);
    }
  });

  router.post("/startGame", auth, async (req, res, next) => {
    try {
   
      const { gameroomId } = req.body;
      const { user } = req;
      const requestUserId = user.dataValues.id;

      console.log("check startgame gameromid", gameroomId);

      const updated = await user.update({ gameroomId });

      const userInGameroom = await Gameroom.findByPk(gameroomId, {
        include: [User]
      });
      const getUserIds = userInGameroom.dataValues.users.map(
        user => user.dataValues.id
      );

      const userQuestionJoin = await UserQuestion.findAll({
        where: {
          userId: {
            [Op.in]: getUserIds
          }
        }
      });

      const findAllQuestions = await Questions.findAll();

      const getQuestionId = findAllQuestions.map(question => {
        return question.dataValues.id;
      });

      const getPlayedQuestionsIds = await userQuestionJoin.map(values => {


        if (getUserIds.includes(values.dataValues.userId)) {
          return values.dataValues.questionId;
        }
      });

      const unplayedQuestions = getQuestionId.filter(
        questionid => !getPlayedQuestionsIds.includes(questionid)
      );
      console.log("unplayedQuestionsss", unplayedQuestions);

    
      const questionsLength = unplayedQuestions.length;

      const ranQue = [Math.floor(Math.random() * questionsLength)];
      const pickQuestion = unplayedQuestions[ranQue];

      if (pickQuestion === undefined) {
  
        const gameEnd = await userInGameroom.update({gameFinished: true})
        const gamerooms = await Gameroom.findAll({
          include: [User, Questions]
        });
        console.log("gmaerooms",gamerooms)
        // prepare the action before sending
        const action = {
          type: "ALL_GAMEROOMS",
          payload: gamerooms
        };

        const string = JSON.stringify(action);

        stream.send(string);
      }
      const clearQuestion = await Questions.update(
        { gameroomId: null },
        {
          where: {
            gameroomId: {
              [Op.eq]: gameroomId
            }
          }
        })

      const updateQuestion = await Questions.update(
        { gameroomId: gameroomId },
        {
          where: {
            id: {
              [Op.eq]: pickQuestion
            }
          }
        }
      );

    
      const gamerooms = await Gameroom.findAll({ include: [User, Questions] });

      console.log("check start game", gamerooms);

      const action = {
        type: "ALL_GAMEROOMS",
        payload: gamerooms
      };

      console.log("check the action which is being sended", action);
      const string = JSON.stringify(action);
      stream.send(string);
      console.log("does the start game reach after res.send");

 

      res.send("wait until every player has answered");
    } catch (error) {
      next(error);
    }
  });

  router.put("/checkAnswer", auth, async (req, res, next) => {
    try {
      const { gameroomId, answer, questionId } = req.body;
      const { user } = req;
      console.log(
        "check if runtime gets to this point",
        user.dataValues.id,
        questionId,
        gameroomId
      );

      const userInGameroom = await Gameroom.findByPk(gameroomId, {
        include: [User]
      });
      const updated = await user.update({ gameroomId: gameroomId });

      if (questionId === undefined) {
  
        const gameEnd = await userInGameroom.update({gameFinished: true})
        const gamerooms = await Gameroom.findAll({
          include: [User, Questions]
        });
        console.log("gmaerooms",gamerooms)
        // prepare the action before sending
        const action = {
          type: "ALL_GAMEROOMS",
          payload: gamerooms
        };

        const string = JSON.stringify(action);

        stream.send(string);
      }else{


      const findQuestion = await Questions.findByPk(questionId);
      const getAnswer = findQuestion.dataValues.answer;

      const modifyanswer = answer.split("");
      const getLength = modifyanswer.length - 1;
      const removeLastItem = modifyanswer.slice(0, getLength);
      const joinItems = removeLastItem.join("");

      const countQuestions = await Questions.count();
      const randomNumber = Math.floor(Math.random() * (countQuestions - 1) + 1);



      //wait until every player inside the gameroom has responded

      const findUser = await User.findAndCountAll({
        where: {
          gameroomId: gameroomId
        }
      });


      if (joinItems === getAnswer) {
        console.log("check if answer is correct", joinItems, getAnswer);

        const getScore = user.dataValues.totalScore;

        const userQuestionJoin = await UserQuestion.findOrCreate({
          where: {
            [Op.and]: [
              { questionId: questionId },
              { userId: user.dataValues.id }
            ]
          },
          defaults: {
            questionId: questionId,
            userId: user.dataValues.id,
            answerCorrect: true,
            answerWrong: false
          }
        });

        // const updateQuestion = findQuestion.update({ correctAnswer: true });
        const updateScore = user.update({
          score: getScore + 1,
          totalScore: getScore + 1
        });
        const getUserScore = user.dataValues.score;

        if (getUserScore === 5) {
          const gameEnd = await userInGameroom.update({gameFinished: true})
      
          const userWon = await user.update({ won: true });

          const gamerooms = await Gameroom.findAll({
            include: [User, Questions]
          });

          // prepare the action before sending
          const action = {
            type: "ALL_GAMEROOMS",
            payload: gamerooms
          };

          const string = JSON.stringify(action);

          stream.send(string);
        }
        res.send(updated);
      } else {
        const userQuestionJoin = await UserQuestion.findOrCreate({
          where: {
            [Op.and]: [
              { questionId: questionId },
              { userId: user.dataValues.id }
            ]
          },
          defaults: {
            questionId: questionId,
            userId: user.dataValues.id,
            answerCorrect: false,
            answerWrong: true
          }
        });

        res.send(updated);
      }
    }
    } catch (error) {
      next(error);
    }
  
  });

  router.post("/newQuestion", auth, async (req, res, next) => {
    try {
      const { user } = req;
      // const requestUserId = user.dataValues.id;
      const { gameroomId, wait } = req.body;

      const updated = await user.update({ gameroomId, answerGiven: true });
      const findUser = await User.findAndCountAll({
        where: {
          gameroomId: gameroomId
        }
      });

      if (findUser.rows.every(user => user.answerGiven === true) === true) {
        const updateUser = await User.update(
          {
            wait: false,
            answerGiven: false
          },

          {
            where: {
              gameroomId: gameroomId
            }
          }
        );

        //ALgorithm for checking if users have played the questions

        const userInGameroom = await Gameroom.findByPk(gameroomId, {
          include: [User]
        });

        const getUserIds = userInGameroom.dataValues.users.map(
          user => user.dataValues.id
        );

        const userQuestionJoin = await UserQuestion.findAll({
          where: {
            userId: {
              [Op.in]: getUserIds
            }
          }
        });

        const findAllQuestions = await Questions.findAll();

        const getQuestionId = findAllQuestions.map(question => {
          return question.dataValues.id;
        });

        const getPlayedQuestionsIds = await userQuestionJoin.map(values => {
          if (getUserIds.includes(values.dataValues.userId)) {
            return values.dataValues.questionId;
          }
        });

        const unplayedQuestions = getQuestionId.filter(
          questionid => !getPlayedQuestionsIds.includes(questionid)
        );

        const questionsLength = unplayedQuestions.length;
        const ranQue = [Math.floor(Math.random() * questionsLength)];
        const pickQuestion = unplayedQuestions[ranQue];
        console.log("check pickquestion", pickQuestion);


        const clearQuestion = await Questions.update(
          { gameroomId: null },
          {
            where: {
              gameroomId: {
                [Op.eq]: gameroomId
              }
            }
          })

        console.log("pickQuestion", pickQuestion);
        const updateQuestion = await Questions.update(
          { gameroomId: gameroomId },
          {
            where: {
              id: {
                [Op.eq]: pickQuestion
              }
            }
          }
        );

        const gamerooms = await Gameroom.findAll({
          include: [User, Questions]
        });

        // prepare the action before sending
        const action = {
          type: "ALL_GAMEROOMS",
          payload: gamerooms
        };

        const string = JSON.stringify(action);
        stream.send(string);
        res.send(user);
      } else {
        console.log("check the else statement");

        const updateUser = await user.update({ wait: true });

        const gamerooms = await Gameroom.findAll({
          include: [User, Questions]
        });

        console.log("else statement", gamerooms);
        const action = {
          type: "ALL_GAMEROOMS",
          payload: gamerooms
        };

        const string = JSON.stringify(action);

        stream.send(string);

        res.send(updateUser);
      }
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = factory;

