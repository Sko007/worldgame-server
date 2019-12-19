const { Router } = require('express')
const User = require('./model')
const Gameroom = require('../gameroom/model')
const auth = require("../auth/middleware")

function factory (stream) {
  const router = new Router()

  router.put(
    '/join', auth,
    async (request, response, next) => {
      try {
        // Must be sent by client
        const {
          gameroomId
        } = request.body

        // Must use auth middleware
        const { user } = request

        // The user from the auth
        // middleware is the row
        // in your table that represent
        // the user that sent
        // the request
        const updated = await user
          .update({ gameroomId })

        // Get all gamerooms,
        // and all users in gamerooms
        // basically, everything
        // in the database
        const gamerooms = await Gameroom
          .findAll({ include: [User] })

        // Always create actions on the server
        // (except for signup and login)
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