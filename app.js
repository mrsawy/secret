//jshint esversion:6
require('dotenv').config()

const express = require(`express`);
const ejs = require(`ejs`);
const bodyParser = require("body-parser");
const mongoose = require(`mongoose`);
var encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
const saltRounds = 10;




const app = express();
app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set(`view engine`,`ejs`);

mongoose.connect(`mongodb://localhost:27017/userDB`);

const userSchema = new  mongoose.Schema({
    userName : String,
    password: String
});

//userSchema.plugin(encrypt , { secret: process.env.SECRET , encryptedFields: ['password'] });


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
    else{
        bcrypt.compare(req.body.password , foudOne.password , function(err, result) {
            // result == true
            if(result==true){res.redirect(`/`)}
            else{res.redirect(`/`)}
        });
    }
 
})
});


app.get(`/register`,(req,res)=>{
    res.render(`register`  );

});
app.post(`/register`,(req,res)=>{

    bcrypt.hash( req.body.password , saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const user = new userModel({
            userName: req.body.username,
            password: hash
        })
        user.save();
        res.redirect(`/`);
    });

});


app.listen(3000,()=>{
    console.log(`listenning`)
});
