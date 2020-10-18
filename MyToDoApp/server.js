const passport = require('passport');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const TodoTask = require("./models/TodoTask");
const auth = require('./auth');

auth(passport);

app = express();
app.set("view engine","ejs");

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'));

const db = require('./config/database');

mongoose.set("useFindAndModify", false);
mongoose.connect(db.mongoURI,{useNewUrlParser: true},()=>{console.log("Connectted to DB")});

const todos = require('./routes/Todos');
app.use('/',todos);


app.listen(3000,()=>console.log("Application has started"));