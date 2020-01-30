const { Router } = require("express");
// const questionAnswer = require("./question_answer")
const User = require("../user/model");
const Gameroom = require("../gameroom/model");
const Question = require("../question_answer/model")

function factory(stream) {
  const router = new Router();

  router.post("/postQuestion", async (req, res, next) => {
    try {
      // const score = await Score.create(req.body);
      // console.log("checkh if the route is hit")
      // console.log("check req.body", req.body)
      const createQuestion = await Question.create(req.body)

      


    //  const action = {
    //    type: "QUESTION",
    //    payload: createQuestion
    //  };

    //  const string = JSON.stringify(action);

      // stream.send(string);

      res.send(createQuestion);
    } catch (error) {
      next(error);
    }
  });



  router.post("/question", async (req, res, next) => {
    try {


      console.log("check if the route got hit")
     
      const randomQuestionId = await Question.findAll()
      const lengthOfQuestions = randomQuestionId.length


      console.log("lengthOfQUestions", lengthOfQuestions)
      
      const randomQuestionNumber = Math.floor(Math.random()* (lengthOfQuestions-1)+1)


      console.log("randomQuestionNumber", randomQuestionNumber)
      
      const getOneQuestionAnswer = await Question.findByPk(randomQuestionNumber)
      console.log("getOneQUestioNAnswer", getOneQuestionAnswer)


      

     const action = {
       type: "QUESTION",
       payload: getOneQuestionAnswer
     };


     const string = JSON.stringify(action);
     console.log("check the string before sending to Stream")
      stream.send(string);

      res.send(string);

      





    } catch (error) {
      next(error);
    }
  });



  router.put("/score", async (request, response, next) => {
    // try {
    //   // Must be sent by client
    //   const { gameroomId } = request.body;

    //   // Must use auth middleware
    //   const { user } = request;

    //   const updated = await user.update(gameroomId, {
    //     include: [User, Score]
    //   });

    //   const gamerooms = await Gameroom.findByPK(gameroomId, {
    //     include: [User, Score]
    //   });

    //   const action = {
    //     type: "ALL_GAMEROOMS",
    //     payload: gamerooms
    //   };

    //   // Serialize the action
    //   const string = JSON.stringify(action);

    //   stream.send(string);

    //   response.send(updated);
    // } catch (error) {
    //   next(error);
    // }
  });

  return router;
}

module.exports = factory;
