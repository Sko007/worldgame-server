const { Router } = require("express");
const User = require("./model");
const Gameroom = require("../gameroom/model");
const auth = require("../auth/middleware");
const { toData } = require("../auth/jwt");
const Questions = require("./model");
const { Op } = require("sequelize");


function factory(stream) {
  const router = new Router();

  router.put("/join", auth, async (request, response, next) => {
    try {
      // Must be sent by client
      console.log(
        "how does the request look like",
        request.headers.authorization
      );


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
      const updateQuestion = await Questions.update({})

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


  router.put("/join1", auth, async (request, response, next) => {
    try {
      // Must be sent by client
      console.log(
        "how does the request look like",
        request.headers.authorization
      );


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

      const updateQuestion = await Questions.update(
        {
          gameroomId: gameroomId
        },
        {
          where: {
            id: {
              [Op.gte]: 0
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

      response.send(updated);
    } catch (error) {
      next(error);
    }
  });
  // router.post(
  //   '/clearAnswers',
  //   async (req, res, next) => {
  //     try {
  //         //need to separate when everybody has given an answer

  //         console.log("check if this route is being hit")
  //         console.log("req.body.userId", req.body.userId)

  //         const update = req.body.userId.forEach(async (ele) => {

  //           const user = await User.findByPk(ele)
  //           console.log("user inside for each", user)
  //           const updateUser = await user.update({answerGiven: false})

  //           console.log("updatedUser inside for each", updateUser)

  //         })

  //         res.send("Userssection clear")

  //     } catch (error) {
  //       next(error)
  //     }

  //   }

  // )

  return router;
}

module.exports = factory;
