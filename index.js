const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const authRouter = require("./auth/router");
const userRouter = require("./user/router");
const cors = require("cors");
const corsMiddleware = cors();

app.use(corsMiddleware);


const Sse = require("json-sse");
const gameRoomModel = require("./gameroom/model");
const gameroomFactory = require("./gameroom/router");
const stream = new Sse();
const gameroomRouter = gameroomFactory(stream);

app.use(jsonParser);

app.use(authRouter);

app.use(userRouter);

app.use(gameroomRouter);



app.get("/stream", async (req, res, next) => {
  try {
      const gamerooms = await gameRoomModel.findAll()

      const action = {
        type:"ALL_GAMEROOMS",
        payload: gamerooms
      }

      const string = JSON.stringify(action)
     
     
      stream.updateInit(string)


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
