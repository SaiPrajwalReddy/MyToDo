const googleOauthStrategy = require('passport-google-oauth').OAuth2Strategy;
secret = require('./secret');

var user;
module.exports = (passport)=>{
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
passport.use(new googleOauthStrategy({
	clientID: secret.clientID,
	clientSecret : secret.clientSecret,
	callbackURL: "http://localhost:3000/auth/google/callback"
},function(accessToken,refreshToken,User,done){
	user = User;
	//console.log(user);
	return done(null,user);
	
}));

};