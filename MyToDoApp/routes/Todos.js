const passport = require('passport');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const TodoTask = require("../models/TodoTask");
var router = express.Router();

router.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/auth/google' }),
  function(req, res) {   
	req.session.user = req.user;
	TodoTask.find({userId:req.user.id},(err,tasks)=>
		{ 
		res.render('todo.ejs',{todotasks : tasks,user : req.user}
		)});
  });

router.get('/',(req,res)=>{ 

	if(req.session.user){
		TodoTask.find({userId:req.session.user.id},(err,tasks)=>{ 			
		res.render('todo.ejs',{todotasks : tasks,user : req.session.user})});
}
else {	
	res.render('todo.ejs',{todotasks:[],user :null});
}});



router.post('/',async (req, res) => {
	console.log("Inside post ");
	if(req.session.user)
	{
		const todoTask = new TodoTask({
		userId:req.session.user.id,
		content: req.body.content});
		try {
			let todo = await todoTask.save();
			res.redirect("/");
		} catch (err) {
			res.redirect("/");
	}}
	else{		
		res.redirect("/auth/google");
	}
});

router
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
		if(err)	{
			return res.send(500,err);
		}
		res.redirect("/");
})
});

router.route("/remove/:id").get((req,res)=>{
	const id = req.params.id;
	TodoTask.findByIdAndRemove(id,err=>{
		if(err){
			res.send(500,err);
	}
	res.redirect("/");
	})});

router.get('/logout',(req,res)=>{				
		req.session.destroy();		
		res.redirect("/");		
});

module.exports = router;