const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const authRouter = require("./auth/router");
// const userRouter = require("./user/router");
const cors = require("cors");
const corsMiddleware = cors();

app.use(corsMiddleware);

const Sse = require("json-sse");
const gameRoomModel = require("./gameroom/model");
const User = require("./user/model")
const stream = new Sse();



app.use(jsonParser);

app.use(authRouter);

const gameroomFactory = require("./gameroom/router");
const gameroomRouter = gameroomFactory(stream);



const joinroomFactory = require("./user/router")
const joinroomRouter = joinroomFactory(stream)

app.use(joinroomRouter)




// app.use(userRouter);


app.use(gameroomRouter);

app.get("/stream", async (req, res, next) => {
  try {
    const gamerooms = await gameRoomModel.findAll({ include: [User] });
   
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
