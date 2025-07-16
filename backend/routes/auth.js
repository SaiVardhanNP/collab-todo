const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const express=require("express");
const { UserModel } = require("../models/User");
const User = require("../models/User");


const router=new express.Router();


router.post("/register",async (req,res)=>{
    const {username,password}=req.body;

    try{
        let user=await UserModel.find({username});

        if(user){
            return res.status(400).json({
                "msg":"User already exists!"
            })
        }

        user = new User({username,password});

        user.password=await bcrypt.hash(password,5);

        await user.save();

        res.status(201).json({
            msg:"User registered successfully!"
        })
    }
    catch(e){
        console.log(e.message);
        res.json({
            msg:"Server Error"
        })
    }
})


router.post("/signin",async(req,res)=>{
    const {username,password}=req.body;


    try{
        const user=await UserModel.find({username});

        if(!user){
            res.status(400).json({
                msg:"User not found!"
            })
            return;
        }

        const isMatch=await bcrypt.verfiy(password,user.password);

        if(!isMatch){
            return res.status(400).json({
                "msg":"Invalid Password!"
            })
        }

        const payload={
            user:{
                id:user.id,
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,
            {expiresIn:"7d"},
            (err,token)=>{
                if(err) throw err;
                res.json({token});
            }
        )
    }
    catch(e){
        console.log(err.message);
        res.status(500).send("Server Error");
    }
})


module.exports={
    router:router
}