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


  router.post("/gameStarted", auth, async (request, response, next) => {
    try {
  
 

      const { gameStarted, gameroomId } = request.body;
      console.log("check gameStarted")
      const { user } = request;
      const findGameroom = await Gameroom.findByPk(gameroomId)
      console.log("findGameroom", findGameroom)
      const updateGameroom = await findGameroom.update(gameStarted)
    
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


  router.get("/fetchUser", auth, async (request, response, next) => {
    try {
  

      const { gameStarted, gameroomId } = request.body;
      console.log("check gameStarted")

      const getAllUser = await User.findAll()
      console.log("getUser", getAllUser)

      const action = {
        type: "USERS",
        payload: getAllUser
      };

      const string = JSON.stringify(action);
      stream.send(string);
      response.send(getAllUser);
    } catch (error) {
      next(error);
    }
  });


  router.post("/gameFinish", auth, async (request, response, next) => {
    try {
  

      const { gameStarted, gameroomId } = request.body;
      console.log("check gameStarted")

      const getAllUser = await User.findAll()
      console.log("getUser", getAllUser)

      const action = {
        type: "USERS",
        payload: getAllUser
      };

      const string = JSON.stringify(action);
      stream.send(string);
      response.send(getAllUser);
    } catch (error) {
      next(error);
    }
  });








  return router;
}

module.exports = factory;



