const { Router } = require('express')
const User = require('./model')
const Gameroom = require('../gameroom/model')
const auth = require("../auth/middleware")
const {toData} = require("../auth/jwt")

function factory (stream) {
  const router = new Router()

  router.put(
    '/join', auth,
    async (request, response, next) => {
      try {
        // Must be sent by client
        console.log("how does the request look like", request.headers.authorization)

        //console.log("data", toData(request.headers.authorization))


        const auth =  request.headers.authorization && request.headers.authorization.split(" ");
        console.log("auth after split", auth)

        if (auth && auth[0] === "Bearer" && auth[1]) {
        
          const data = toData(auth[1]);
          console.log("data after split", data)
        }
        
        const {
          gameroomId, ready
        } = request.body

        console.log("gamerromId in join", gameroomId)
        console.log("check the ready boolean", ready)

        // Must use auth middleware
        const { user } = request

        console.log("how does user inside join looks like", user)

        // The user from the auth
        // middleware is the row
        // in your table that represent
        // the user that sent
        // the request
        const updated = await user
          .update({ gameroomId, ready })

          console.log("Promise", updated)

        // Get all gamerooms,
        // and all users in gamerooms
        // basically, everything
        // in the database
        const gamerooms = await Gameroom
          .findAll({ include: [User] })

        // Always create actions on the server
        // (except for signup and login)

        console.log("gamerooms",gamerooms)
        const action = {
          type: 'ALL_GAMEROOMS',
          payload: gamerooms
        }

        // Serialize the action
        const string = JSON
          .stringify(action)

        stream.send(string)

        response.send(updated)
      } catch (error) {
        next(error)
      }
    }
  )

  return router
}

module.exports = factory