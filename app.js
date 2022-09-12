//jshint esversion:6
require('dotenv').config()

const express = require(`express`);
const ejs = require(`ejs`);
const bodyParser = require("body-parser");
const mongoose = require(`mongoose`);
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
var LocalStrategy = require('passport-local').Strategy;




const app = express();

app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set(`view engine`,`ejs`);


app.use(session({
    secret: 'SSSEEECCCRRREEETTT',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
  }));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(`mongodb://localhost:27017/userDB`);

const userSchema = new  mongoose.Schema({
    userName : String,
    password: String
});

userSchema.plugin(passportLocalMongoose);


const userModel = new mongoose.model(`users`, userSchema);

passport.use(new LocalStrategy(userModel.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findOne(id, function (err, user) {
      done(err, user);
    });
  });


app.get(`/`,(req,res)=>{
    res.render(`home`  );

});

app.get(`/login`,(req,res)=>{
    res.render(`login`);

});
app.post(`/login`,(req,res)=>{

    const user = new userModel({
        userName:req.body.username,
        password:req.body.password
    })
    req.login(user,(err)=>{
        if(err){
            console.log(err)
            res.render(`login`)
        }else{
            passport.authenticate(`local`)(req,res,()=>{
                res.redirect(`/secrets`)})
        }
    })

});

app.get(`/secrets`,(req,res)=>{

if(req.isAuthenticated()){
    res.render(`secrets`);
}else{
    res.redirect(`/`);
}

})


app.get(`/register`,(req,res)=>{
    
    res.render(`register`  );

});
app.post(`/register`,(req,res)=>{

    userModel.register({username:req.body.username },req.body.password, function(err, user) {
        if (err) {console.log(err);
        res.redirect(`/`);
        }else{
            passport.authenticate(`local`)(req,res,()=>{
                res.redirect(`/secrets`)
            })
        }
        });
      });


      app.get(`/logout`,(req,res)=>{
        req.logout(function(err) {
            if (err) { return next(err); }});
        res.redirect(`/`)
      })



app.listen(3000,()=>{
    console.log(`listenning`)
});
