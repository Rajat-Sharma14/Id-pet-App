const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require("../server/connection/db")
const routes = require("./v1/routes/userRoutes")
const port = 3001
const path = require("path")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use("/",routes)

app.use('/static', express.static(path.join(__dirname, 'uploadImg')));

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.listen(port,()=>{
    console.log(`App listening on port http://localhost:${port}`)
    mongoose.db()
})