// const express = require("express")
// const {Router}= express
const { Router } = require("express");

const Gameroom = require("./model");

function factory(stream) {
  const router = new Router();



  router.post("/gameroom", async (req, res, next) => {
      
    try {
        
      const gameroom = await Gameroom.create(req.body);

      const action = {
        type: "NEW_GAMEROOM",
        payload: gameroom
      };

      const string = JSON.stringify(action);

      stream.send(string);

      res.send(gameroom);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = factory;



// router.get('/secret-endpoint', (req, res) => {
//     const auth = req.headers.authorization && req.headers.authorization.split(' ')
//     if (auth && auth[0] === 'Bearer' && auth[1]) {
//       try {
//         const data = toData(auth[1])
//         res.send({
//           message: 'Thanks for visiting the secret endpoint.',
//           data
//         })
//       }
//       catch(error) {
//         res.status(400).send({
//           message: `Error ${error.name}: ${error.message}`,
//         })
//       }
//     }
//     else {
//       res.status(401).send({
//         message: 'Please supply some valid credentials'
//       })
//     }
//   })

