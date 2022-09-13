//jshint esversion:6
require('dotenv').config()

const express = require(`express`);
const ejs = require(`ejs`);
const bodyParser = require("body-parser");
const mongoose = require(`mongoose`);
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require(`passport-google-oauth20`).Strategy;
const findOrCreate = require('mongoose-findorcreate')




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


const userSchema = new mongoose.Schema({
    userName : String,
    password: String,
    googleId: String,

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const userModel = new mongoose.model(`users`, userSchema);

passport.use(new LocalStrategy(userModel.authenticate()));

// use static serialize and deserialize of model for passport session support

passport.serializeUser(function(user, done) {
    done(null, user.id); 
   // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    userModel.findById(id, function(err, user) {
        done(err, user);
    });
});

  
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    scope: ['profile', 'email']

  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

/*
    userModel.findOne({googleId:profile.id},(err,foundObj)=>{
        if(foundObj==null){
            const user = new userModel({
                id:profile.id
            })
            user.save();
        }

    })*/


    userModel.findOrCreate({ googleId: profile.id }, function (err, user) {

      console.log(user);
      return cb(err, user);

    });
  }
));


app.get(`/`,(req,res)=>{
    res.render(`home`  );
});



app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
  );



  app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });


  app.get(`/secrets`,(req,res)=>{
    if(req.isAuthenticated()){
        res.render(`secrets`);
    }else{
        res.redirect(`/`);
    }})





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
