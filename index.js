const express = require("express");
const app = express();
const port = process.env.PORT
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const authRouter = require("./auth/router");
// const userRouter = require("./user/router");
const cors = require("cors");
const corsMiddleware = cors();

app.use(corsMiddleware);

const Sse = require("json-sse");
const gameRoomModel = require("./gameroom/model");
const User = require("./user/model");
const Questions = require("./question_answer/model");
const stream = new Sse();

app.use(jsonParser);

app.use(authRouter);

const gameroomFactory = require("./gameroom/router");
const gameroomRouter = gameroomFactory(stream);
app.use(gameroomRouter)

const joinroomFactory = require("./user/router");
const joinroomRouter = joinroomFactory(stream);

app.use(joinroomRouter);

const question_answerFactory = require("./question_answer/router");
const question_answerRouter = question_answerFactory(stream);

app.use(question_answerRouter);


app.get("/stream", async (req, res, next) => {
  try {
    const gamerooms = await gameRoomModel.findAll({ include: [User, Questions] });

    console.log("iiiiiiiiiiiiiiiiiiiiimmmmmmmmmmmmmmmmmmmmmm index", gamerooms)

    const action = {
      type: "ALL_GAMEROOMS",
      payload: gamerooms
    };

    const string = JSON.stringify(action);

    stream.updateInit(string);

    stream.init(req, res);
  } catch (error) {
    next(error);
  }
});

app.get("/", (req, res, next) => {
  stream.send("test");

  res.send("Hallo");
});

app.listen(port, () => console.log("server is connected"));
