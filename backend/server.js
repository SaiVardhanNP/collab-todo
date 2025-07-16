require("dotenv").config();
const express=require("express");
const cors=require("cors");
const { connectDB } = require("./config/db");
const authRoutes=require("./routes/auth");
const taskRoutes=require("./routes/tasks")

const app=express();


app.use(cors());
app.use(express.json());


const port=process.env.PORT || 3000;

connectDB();

app.use("/api/auth",authRoutes);

app.use("/api/tasks",taskRoutes);

app.get("/",(req,res)=>{
    res.send("<h1>Todo Board is running!</h1>")
})

app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})


