var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/userinfo.js');
var hashGen = require('../helpers/hashGen.js');
var logger = require('../helpers/logger.js');
function setUpStrategy(passport){
	passport.serializeUser(function(user, done) {
		console.log('in SerializeUser..');
		console.log(user)
        done(null, user["ID"]);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
		console.log('in SerializeUser..');
        User.fetchByCols(["*"], ["id","$eq",id], function(err, user) {
            if(!err){
            	console.log(user[0])
				done(err,user[0]);
			}else{
				console("I dont know failed..");
			}
        });
    });
	
	passport.use('local-signin',new LocalStrategy({
		usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
	},function(req, email, password, cb){
		process.nextTick(function(){
			logger.log('info','About to check the authentication with '+email+"and password as "+password);
			console.log('About to check the authentication with '+email+"and password as "+password);
			User.fetchByCols(["*"], ["email","$eq",email],function(err,rows){
				if(rows.length == 0){
					logger.log('info','email does not exist in database');
					console.log('email does not exist in database')
					cb(null,false);
				}else{
					console.log(rows);
					console.log("Chichaa");
					console.log(rows[0]["PASSWORD"]);
					console.log("Machaa");
					if( hashGen.compHash(rows[0]["PASSWORD"], password) ){
						logger.log('info','Authentication succesffunly');
						cb(null,rows[0]);
					}else{
						logger.log('info','Passwords not matched');
						console.log('Passwords not matched');
						cb(null,false);
					}
				}
			});
		});
	}));
}
module.exports = setUpStrategy;