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
      // const auth =
      //   req.headers.authorization && req.headers.authorization.split(" ");

      // if (auth && auth[0] === "Bearer" && auth[1]) {
      //   const data = toData(auth[1]);
      // }

      const { gameroomId } = req.body;
      const { user } = req;
      const requestUserId = user.dataValues.id;

      console.log("check startgame gameromid", gameroomId);

      const updated = await user.update({ gameroomId });

      // const pullQuestion = await Questions.findOne({
      //   where: {
      //     id: randomQuestion
      //   }
      // });

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

      // const countQuestions = unplayedQuestions.map((_, index) => index)
      // // const randomNumber = Math.floor(
      // //   Math.random() * (countQuestions - 1) + 1
      // //   );
      const questionsLength = unplayedQuestions.length;

      const ranQue = [Math.floor(Math.random() * questionsLength)];
      const pickQuestion = unplayedQuestions[ranQue];

      console.log("pickQuestion", ranQue, pickQuestion);
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
      console.log("updateQuestion", updateQuestion);

      // const idOfQuestion = pullQuestion.dataValues.id;
      // const updateQuestion = await pullQuestion.update({
      //   gameroomId: gameroomId
      // });

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

      // const clearQuestion = await Questions.update({
      //   where: {
      //     id: {
      //       [Op.eq]: null
      //     }
      //   }
      // });

      res.send("wait until every player has answered");
      // const clearQuestionId = await pullQuestion.update({})
    } catch (error) {
      next(error);
    }
  });

  router.put("/checkAnswer", auth, async (req, res, next) => {
    try {
      // const auth =
      //   req.headers.authorization && req.headers.authorization.split(" ");

      // if (auth && auth[0] === "Bearer" && auth[1]) {
      //   const data = toData(auth[1]);
      // }

      const { gameroomId, answer, questionId } = req.body;
      const { user } = req;
      console.log(
        "check if runtime gets to this point",
        user.dataValues.id,
        questionId,
        gameroomId
      );
      const findQuestion = await Questions.findByPk(questionId);
      const getAnswer = findQuestion.dataValues.answer;

      const modifyanswer = answer.split("");
      const getLength = modifyanswer.length - 1;
      const removeLastItem = modifyanswer.slice(0, getLength);
      const joinItems = removeLastItem.join("");



      const countQuestions = await Questions.count();
      const randomNumber = Math.floor(Math.random() * (countQuestions - 1) + 1);

      // const allQuestions = await Questions.findAll({include:[User]})
    
      const updated = await user.update({ gameroomId: gameroomId });

      //wait until every player inside the gameroom has responded

      const findUser = await User.findAndCountAll({
        where: {
          gameroomId: gameroomId
        }
      });

      // const checkAnswerGiven = userAnswerGiven.every(user => user === true);
      // console.log("Answer Given", checkAnswerGiven);

      if (joinItems === getAnswer) {
        console.log("check if answer is correct", joinItems, getAnswer);

        const getScore = user.dataValues.score;

        const userQuestionJoin = await UserQuestion.findOrCreate({
          where: {
            [Op.and]: [{ questionId: questionId }, { userId: user.dataValues.id }]
          },
          defaults: {
            questionId: questionId,
            userId: user.dataValues.id,
            answerCorrect: true,
            answerWrong: false
          }
        });

        // const updateQuestion = findQuestion.update({ correctAnswer: true });
        const updateScore = user.update({ score: getScore + 10, totalScore: getScore+10 });

        res.send(updated);
      } else {


        const userQuestionJoin = await UserQuestion.findOrCreate({
          where: {
            [Op.and]: [{ questionId: questionId }, { userId: user.dataValues.id }]
          },
          defaults: {
            questionId: questionId,
            userId: user.dataValues.id,
            answerCorrect: false,
            answerWrong: true
          }
        });
        // const updateQueston = findQuestion.update({ correctAnswer: false });

        res.send(updated);

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

// const gameroom = await Gameroom.findByPk(gameroomId, { include: [User] });
// const { users } = gameroom;

// const sorted = users.sort((a, b) => a.id - b.id);
// const mine = sorted.findIndex(someone => someone.id === user.id);
// const next = mine + 1;
// const real = next % sorted.length;
// const nextUser = sorted[real];
// const nextId = nextUser.id;

// await gameroom.update({ turn: nextId });
