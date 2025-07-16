require("dotenv").config();
const express=require("express");
const cors=require("cors");
const { connectDB } = require("./config/db");

const app=express();


app.use(cors());
app.use(express.json());


const port=process.env.PORT || 3000;

connectDB();


app.get("/",(req,res)=>{
    res.send("<h1>Todo Board is running!</h1>")
})

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})


