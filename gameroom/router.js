const { Router } = require("express");
const Gameroom = require("./model");
const auth = require("../auth/middleware");
const User = require("../user/model");
const Questions = require("../question_answer/model");
const { toData } = require("../auth/jwt");
const { Op } = require("sequelize");

function factory(stream) {
  const router = new Router();

  router.post("/gameroom", async (req, res, next) => {
    try {
      const gameroom = await Gameroom.create(req.body);

      const users = { users: [] };
      const questions = { questions: [] };

      console.log("gameroom", gameroom);
      const gameroomUser = { ...gameroom.dataValues, ...users, ...questions };

      console.log("1111111111111111111111111", gameroomUser);
      const action = {
        type: "NEW_GAMEROOM",
        payload: gameroomUser
      };

      console.log("action", action);
      const string = JSON.stringify(action);

      stream.send(string);

      res.send(gameroom);
    } catch (error) {
      next(error);
    }
  });

  router.put("/gamelogic", auth, async (req, res, next) => {
    try {
      //console.log("data", toData(request.headers.authorization))

      const auth =
        req.headers.authorization && req.headers.authorization.split(" ");

      if (auth && auth[0] === "Bearer" && auth[1]) {
        const data = toData(auth[1]);
      }

      const { gameroomId } = req.body;
      const { user } = req;
      const requestUserId = user.dataValues.id;

      const countQuestions = await Questions.count();
      const randomNumber = Math.floor(Math.random() * countQuestions);

      const updated = await user.update({ gameroomId });
      const findUser = await User.findAndCountAll({
        where: {
          gameroomId: gameroomId
        }
      });

      const UserIdInsideGameroom = findUser.rows.map(
        user => user.dataValues.id
      );

      const updateQuestion = await Questions.update(
        {
          gameroomId: gameroomId
        },
        {
          where: {
            id: {
              [Op.eq]: randomNumber
            }
          }
        }
      );

      const gamerooms = await Gameroom.findAll({ include: [User, Questions] });

      const action = {
        type: "ALL_GAMEROOMS",
        payload: gamerooms
      };

      const string = JSON.stringify(action);

      stream.send(string);

      res.send(updated);
    } catch (error) {
      next(error);
    }
  });

  router.post("/startGame", auth, async (req, res, next) => {
    try {
      const auth =
        req.headers.authorization && req.headers.authorization.split(" ");

      if (auth && auth[0] === "Bearer" && auth[1]) {
        const data = toData(auth[1]);
      }

      const { gameroomId } = req.body;
      const { user } = req;
      const requestUserId = user.dataValues.id;
      console.log("check the gameroomId", gameroomId);

      // const findUser = await User.findAndCountAll({
      //   where: {
      //     gameroomId: gameroomId
      //   }
      // });

      // const userIdInsideGameroom = findUser.rows.map(user => user.dataValues.id);
      // const userReady = findUser.rows.map(user=> user.startGame)

      // if(userReady.every(item => item === true) === true){

      const updated = await user.update({ gameroomId });

      const countQuestions = await Questions.count();
      const randomQuestion = Math.floor(
        Math.random() * (countQuestions - 1) + 1
      );

      console.log("randomQuestion", randomQuestion);
      const pullQuestion = await Questions.findOne({
        where: {
          id: randomQuestion
        }
      });

      console.log("pullquestion", pullQuestion);
      console.log("check the gameroomId in startGame", gameroomId);

      const idOfQuestion = pullQuestion.dataValues.id;
      const updateQuestion = await pullQuestion.update({
        gameroomId: gameroomId
      });
      console.log("update Qursiton", updateQuestion);

      console.log("perform Gamerooms");

      const gamerooms = await Gameroom.findAll({ include: [User, Questions] });

      console.log("check content of gameroom", gamerooms);
      const action = {
        type: "ALL_GAMEROOMS",
        payload: gamerooms
      };

      console.log("check the action before send", action);

      const string = JSON.stringify(action);

      stream.send(string);

      res.send("wait until every player has answered");

      // }
    } catch (error) {
      next(error);
    }
  });

  router.post("/checkAnswer", auth, async (req, res, next) => {
    try {
      //console.log("data", toData(request.headers.authorization))
      console.log("check if answerroute is hit")
      const auth =
        req.headers.authorization && req.headers.authorization.split(" ");

      if (auth && auth[0] === "Bearer" && auth[1]) {
        const data = toData(auth[1]);
      }

      const { gameroomId, answer, questionId } = req.body;
      const { user } = req;
    

      const findQuestion = await Questions.findByPk(questionId)
      console.log("findQuestoin",findQuestion)

      const getAnswer = findQuestion.dataValues.answer

      console.log("answer out of database", getAnswer)
      console.log("answer from user", answer );

      const modifyanswer = answer.split("")
      const getLength = modifyanswer.length -1
      console.log("getLength", getLength)

      const removeLastItem = modifyanswer.slice(0, getLength )
      console.log("removeLastItem", removeLastItem)
      const joinItems = removeLastItem.join("")
      console.log("joinItem", joinItems)
      if(joinItems === getAnswer){
        console.log("check if answer is correct")

        const getScore = user.dataValues.score
        const updateScore = user.update({score: getScore+10})


        console.log("correct Answer")
      }else{

        console.log("this is the wrong answer")
      }
      
      



      const updated = await user.update({ gameroomId });

      const gamerooms = await Gameroom.findAll({ include: [User, Questions] });

      const action = {
        type: "ALL_GAMEROOMS",
        payload: gamerooms
      };

      const string = JSON.stringify(action);

      stream.send(string);

      res.send(updated);
    } catch (error) {
      next(error);
    }
  });

  router.put("/newQuestion", auth, async (req, res, next) => {
    try {
      //console.log("data", toData(request.headers.authorization))

      const auth =
        req.headers.authorization && req.headers.authorization.split(" ");

      if (auth && auth[0] === "Bearer" && auth[1]) {
        const data = toData(auth[1]);
      }

      const { gameroomId, answerGiven } = req.body;
      const { user } = req;
      const requestUserId = user.dataValues.id;
      const countQuestions = await Questions.count();
      const randomNumber = Math.floor(Math.random() * countQuestions);

      const updated = await user.update({ gameroomId, answerGiven });
      const findUser = await User.findAndCountAll({
        where: {
          gameroomId: gameroomId
        }
      });

      const UserIdInsideGameroom = findUser.rows.map(
        user => user.dataValues.answergiven
      );

      if (findUser.rows.each(user => user.answerGiven === true) === false) {
        console.log("inside first if statement");

        const gamerooms = await Gameroom.findAll({
          include: [User, Questions]
        });

        const action = {
          type: "ALL_GAMEROOMS",
          payload: gamerooms
        };

        const string = JSON.stringify(action);

        stream.send(string);

        res.send("Please wait");
      } else {
        console.log("check the else statement");

        const updateQuestion = await Questions.update(
          {
            gameroomId: gameroomId
          },
          {
            where: {
              id: {
                [Op.eq]: randomNumber
              }
            }
          }
        );

        const gamerooms = await Gameroom.findAll({
          include: [User, Questions]
        });

        const action = {
          type: "ALL_GAMEROOMS",
          payload: gamerooms
        };

        const string = JSON.stringify(action);

        stream.send(string);
        res.send(updated);
      }
    } catch (error) {
      next(error);
    }
  });

  // router.get("/question", async (req, res, next) => {

  //   console.log("got here")

  //   // const { user } = req
  //   // const userId = user.id

  //   console.log("req.body inside gamelogic", req.body)

  //   try {

  //     const questionAnswer = [
  //       {
  //        id: 1,
  //        question: "What is the greatest Country you have ever seen?",
  //        answer: "Netherlands"
  //      },

  //       {
  //        id: 2,
  //        question: "Which country has the most inhabitants on earth?",
  //        answer: "India"
  //      }]

  //      //make modeö for question
  //      // if anser findbypk use id of te question() check also the jwt
  //      //if nswer was good then change/update gameroomtable.turn als send new questions
  //      //not good awnser senc correc answer to user

  //    const action2 = {
  //      type: "QUESTION",
  //      payload: questionAnswer[1]
  //    };

  //    const string2 = JSON.stringify(action2);

  //   //  stream.send(string);
  //     stream.send(string2);

  //     res.send({bs:null});
  //   } catch (error) {
  //     next(error);
  //   }
  // });

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
