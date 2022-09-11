//jshint esversion:6
require('dotenv').config()

const express = require(`express`);
const ejs = require(`ejs`);
const bodyParser = require("body-parser");
const mongoose = require(`mongoose`);
var encrypt = require('mongoose-encryption');



const app = express();
app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set(`view engine`,`ejs`);

mongoose.connect(`mongodb://localhost:27017/userDB`);

const userSchema = new  mongoose.Schema({
    userName : String,
    password: String
});

userSchema.plugin(encrypt , { secret: process.env.SECRET , encryptedFields: ['password'] });


const userModel = new mongoose.model(`users`, userSchema);



app.get(`/`,(req,res)=>{
    res.render(`home`  );

});
app.get(`/learn`,(req,res)=>{
    res.send(`<span style= 'margin:auto'>this is span</span>`  );

});
app.get(`/login`,(req,res)=>{
    res.render(`login`  );

});
app.post(`/login`,(req,res)=>{
userModel.findOne({userName:req.body.username},(err,foudOne)=>{
    if(foudOne == null){
        res.redirect(`/login`)
    }
    else if(foudOne.password==req.body.password){
        res.redirect(`/`)
    }
    else{
        res.redirect(`/login`)

    }
})
});


app.get(`/register`,(req,res)=>{
    res.render(`register`  );

});
app.post(`/register`,(req,res)=>{
const user = new userModel({
    userName: req.body.username,
    password: req.body.password
})
user.save();
res.redirect(`/`);
});


app.listen(3000,()=>{
    console.log(`listenning`)
});
