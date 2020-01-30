const { Router } = require("express");
const Gameroom = require("./model");
const auth = require("../auth/middleware");
const User = require("../user/model");
const Question = require("../question_answer/model");

function factory(stream) {
  const router = new Router();

  router.post("/gameroom", async (req, res, next) => {
    try {
      const gameroom = await Gameroom.create(req.body);


      const users ={users:[]}
      console.log("gameroom", gameroom)
      const gameroomUser = {...gameroom.dataValues, ...users}


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


  // for an specific room
  router.post("/gamelogic", auth, async (req, res, next) => {
    try {
      const { user } = req;
      const userId = user.id;
      const gameroomId = Number(req.body.gameroomId);

  


      // update({ 
      //   questionId: true
      // }, {
      //   where: {age: 7},
      //   returning: true, // needed for affectedRows to be populated
      //   plain: true // makes sure that the returned instances are just plain objects
      // })



      // const userInGameroom = await User.findAll({
      //   where: { gameroomId: user.gameroomId }
      // });
      // console.log("userInGameroom", userInGameroom);

      // const action = {
      //   type: "USER",
      //   payload: userInGameroom
      // };

      // const string = JSON.stringify(action);

      // stream.send(string);

      res.send(action);
    } catch (error) {
      next(error);
    }
  });

  router.post("/answer", auth, async (req, res, next) => {
    const { user } = req;
    const { gameroomId, points } = user;

    try {
      const { answer, id } = req.body;

      const questions = [
        {
          id: 1,
          question: "What is the greatest Country you have ever seen?",
          answer: "Netherlands"
        },

        {
          id: 2,
          question: "Which country has the most inhabitants on earth?",
          answer: "India"
        }
      ];

      // const question = questions.find(question => question.id === id)
      // const correct = question.answer === answer
      // const message = correct ? {answer: true}: {answer: false, correctAnswer: "todo"}

      // if(correct){

      //   User.findByPk(user.dataValues.id)
      //   .then(result => result.update({score: result.dataValues.score + 1}))

      // }

      const gameroom = await Gameroom.findByPk(gameroomId, { include: [User] });
      const { users } = gameroom;

      const sorted = users.sort((a, b) => a.id - b.id);
      const mine = sorted.findIndex(someone => someone.id === user.id);
      const next = mine + 1;
      const real = next % sorted.length;
      const nextUser = sorted[real];
      const nextId = nextUser.id;

      await gameroom.update({ turn: nextId });
      // [a, b, c]
      //  0  1  2

      //  stream.send()

      res.send(message);
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
