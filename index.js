const express = require("express")
const app = express()
const port = process.env.PORT || 4000
const bodyParser = require("body-parser")
const jsonParser = bodyParser.json()
const authRouter = require("./auth/router")
const userRouter = require("./user/router")
const cors = require("cors")
const corsMiddleware = cors()





app.use(corsMiddleware)

app.use(jsonParser)

app.use(authRouter)

app.use(userRouter)


app.get("/", (req,res,next) => {

    res.send("Hallo")


})


app.listen(port, ()=> console.log("server is connected"))