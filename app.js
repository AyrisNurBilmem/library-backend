require("dotenv").config({path: "./config.env"});
const express = require("express");
const app = express();
const connectDB = require("./config/db");
const cors = require("cors");

//mongoDB
connectDB();
app.use(cors());
app.use(express.json());
app.use('/private', require('./routes/private'));
app.use('/auth', require('./routes/auth'));


app.listen(3002, function(){
    console.log("Server is now running on port 3002");
})