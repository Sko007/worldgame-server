const { Router } = require("express");
// const questionAnswer = require("./question_answer")
const User = require("../user/model");
const Gameroom = require("../gameroom/model");
const Questions = require("../question_answer/model")
const auth = require("../auth/middleware")
const { toData } = require("../auth/jwt");

function factory(stream) {
  const router = new Router();

  router.post("/postQuestion", async (req, res, next) => {
    try {
    
      const createQuestion = await Questions.create(req.body)


      res.send(createQuestion);
    } catch (error) {
      next(error);
    }
  });



  router.post("/question", async (req, res, next) => {
    try {



  const auth =
        request.headers.authorization &&
        request.headers.authorization.split(" ");
      console.log("auth after split", auth);

      if (auth && auth[0] === "Bearer" && auth[1]) {
        const data = toData(auth[1]);
        console.log("data after split", data);
      }

      const { gameroomId, ready } = request.body;

      console.log("gamerromId in join", gameroomId, ready);


      const { user } = request;

      const updated = await user.update({ gameroomId, ready });

      const gamerooms = await Gameroom.findAll({ include: [User, Questions] });

      const action = {
        type: "ALL_GAMEROOMS",
        payload: gamerooms
      };

      const string = JSON.stringify(action);

      stream.send(string);

      response.send(updated);
      
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