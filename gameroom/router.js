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

      const countQuestions = await Questions.count();
      const randomQuestion = Math.floor(
        Math.random() * (countQuestions - 1) + 1
      );

      const pullQuestion = await Questions.findOne({
        where: {
          id: randomQuestion
        }
      });

      const idOfQuestion = pullQuestion.dataValues.id;
      const updateQuestion = await pullQuestion.update({
        gameroomId: gameroomId
      });

      const gamerooms = await Gameroom.findAll({ include: [User, Questions] });

      console.log("check start game", gamerooms);

      const action = {
        type: "ALL_GAMEROOMS",
        payload: gamerooms
      };

      const string = JSON.stringify(action);
      stream.send(string);
      res.send("wait until every player has answered");
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

      const userQuestionJoin = await UserQuestion.findOrCreate({
        where: {
          [Op.and]: [{ questionId: questionId }, { userId: user.dataValues.id }]
        },
        defaults: {
          questionId: questionId,
          userId: user.dataValues.id
        }
      });

      // const allQuestions = await Questions.findAll({include:[User]})
      console.log(
        "userQuestionJoin and gamerromid",
        userQuestionJoin,
        gameroomId
      );
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

        const updateQuestion = findQuestion.update({ correctAnswer: true });
        const updateScore = user.update({ score: getScore + 10 });

        res.send(updated);
      } else {
        console.log("inside the else statement of first if");
        const updateQueston = findQuestion.update({ correctAnswer: false });

        res.send(updated);

        console.log("this is the wrong answer");
      }
    } catch (error) {
      next(error);
    }
  });

  router.post("/newQuestion", auth, async (req, res, next) => {
    try {
      //console.log("data", toData(request.headers.authorization))

      // const auth =
      //   req.headers.authorization && req.headers.authorization.split(" ");

      // if (auth && auth[0] === "Bearer" && auth[1]) {
      //   const data = toData(auth[1]);
      // }

      // const { gameroomId, answerGiven } = req.body;
      const { user } = req;
      console.log("check how user looks in newQuestion", user);
      // const requestUserId = user.dataValues.id;
      const { gameroomId, wait } = req.body;
      console.log("check the in newQuestion gameroomid and wait", gameroomId);

      const countQuestions = await Questions.count();
      const randomNumber = Math.floor(Math.random() * (countQuestions - 1) + 1);

      const updated = await user.update({ gameroomId, answerGiven: true });
      const findUser = await User.findAndCountAll({
        where: {
          gameroomId: gameroomId
        },
        include: [Questions]
      });

      const findAllUser = await User.findAll({
        where: { gameroomId: gameroomId }
      });

      console.log("check findAllUser", findAllUser);

      console.log("findUser in newQuestion", findUser);

      const checkUserGivenAnswer = findUser.rows.map(
        user => user.dataValues.answerGiven
      );

      if (findUser.rows.every(user => user.answerGiven === true) === true) {
        console.log("chekc if every route is hit");
        console.log("gameroomId", gameroomId);

        // const updateUser = await findUser.update({wait: false});

        // const broadUpdateUser = await findUser.update({wait:false, answerGiven:false})

        // const broadUpdate = await findAllUser.update({wait:false, answergiven: false})
        // const checkUserGivenAnswer = findAllUser.forEach(async user => {
        //   const userupdate = await user.update({
        //     wait: false,
        //     answerGiven: false
        //   });
        //   return userupdate;
        // });

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

        // console.log("checkUserGivenAnswer", checkUserGivenAnswer);
        ///////////////in if or else I need to update the question
        console.log("check if ");
        const gamerooms = await Gameroom.findAll({
          include: [User, Questions]
        });

        console.log("if statement", gamerooms);
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

  router.post("/ready", auth, async (req, res, next) => {
    try {
      //console.log("data", toData(request.headers.authorization))

      // const auth =
      //   req.headers.authorization && req.headers.authorization.split(" ");

      // if (auth && auth[0] === "Bearer" && auth[1]) {
      //   const data = toData(auth[1]);
      // }

      // const { gameroomId, answerGiven } = req.body;
      const { user } = req;
      console.log("check how user looks in newQuestion", user);
      // const requestUserId = user.dataValues.id;
      const { gameroomId } = req.body;
      console.log("check the in newQuestion gameroomid and wait", gameroomId);

      const findUser = await User.findAndCountAll({
        where: {
          gameroomId: gameroomId
        },
        include: [Questions]
      });

      const updated = await user.update({ gameroomId, answerGiven: true });

      if (findUser.rows.every(user => user.answerGiven === true) === true) {
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
        res.send(updated);
      }

      res.status(200).send("wait");
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
