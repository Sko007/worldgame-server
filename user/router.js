const bcrypt = require("bcrypt");
const { Router } = require("express");
const User = require("./model");

const router = new Router();

router.post("/signup", (req, res, next) => {
    
  const userToCreate = {
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    username: req.body.username
  };

  User.create(userToCreate)
    .then(user => {
      res.json(user);
    })
    .catch(console.error);
});

module.exports = router;
