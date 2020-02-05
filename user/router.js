const { Router } = require("express");
const { toData } = require("../auth/jwt");
const User = require("./model");
const Gameroom = require("../gameroom/model");
const Questions = require("../question_answer/model");
const auth = require("../auth/middleware");

function factory(stream) {
  const router = new Router();

  router.put("/join", auth, async (request, response, next) => {
    try {
  
      //   const auth =
      //   request.headers.authorization &&
      //   request.headers.authorization.split(" ");

      // if (auth && auth[0] === "Bearer" && auth[1]) {
      //   const data = toData(auth[1]);
      // }

      const { gameroomId, ready, score, wait, answerGiven } = request.body;
      const { user } = request;
      const updated = await user.update({ gameroomId, ready, score, wait, answerGiven });
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


  return router;
}

module.exports = factory;
