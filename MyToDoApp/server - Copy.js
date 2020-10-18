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

app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {   
	req.session.user = req.user;
	TodoTask.find({userId:req.user.id},(err,tasks)=>
{ 
console.log(tasks);
res.render('todo.ejs',{todotasks : tasks,user : req.user})
});
    //res.redirect('/');
  });

app.get('/',(req,res)=>{ 

	if(req.session.user){
TodoTask.find({userId:req.session.user.id},(err,tasks)=>
{ 
console.log(tasks);
res.render('todo.ejs',{todotasks : tasks,user : req.session.user})
});
}
else {	
	res.render('todo.ejs',{todotasks:[],user :null});
}
});



app.post('/',async (req, res) => {
	console.log("Inside post ");
	if(req.session.user)
	{
		const todoTask = new TodoTask({
		userId:req.session.user.id,
		content: req.body.content
		
});
try {
let todo = await todoTask.save();
res.redirect("/");

} catch (err) {

console.log('err' + err);
res.redirect("/");
	}}
	else
	{	
	res.redirect("/auth/google");
	}
});

app
.route("/edit/:id")
.get((req,res)=>{TodoTask.find({},(err,tasks)=>{
	const id = req.params.id;
	console.log("Id is "+id);
	res.render('todoedit.ejs',{todoTasks:tasks,taskId:id,user:req.session.user})
	})
})
.post((req,res)=>{
	const id = req.params.id;
	TodoTask.findByIdAndUpdate(id,{content:req.body.content},err=>{
		if(err)
			{
			return res.send(500,err);
		}
		res.redirect("/");
})
});

app.route("/remove/:id").get((req,res)=>{
	const id = req.params.id;
	TodoTask.findByIdAndRemove(id,err=>{
		if(err){
			res.send(500,err);
	}
	res.redirect("/");
	})});

app.get('/logout',(req,res)=>{				
		req.session.destroy();		
		res.redirect("/");		
});


app.get('/login',(req,res)=>{	
	user=null;
	console.log(user);
	req.session.destroy();
	res.redirect("/");
})

app.listen(3000,()=>console.log("Application has started"));