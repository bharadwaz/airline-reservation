var express = require('express')
var logger = require('../helpers/logger.js');
var selectParser = require('../helpers/selectParser.js');
var User = require('../models/userinfo.js');
var hashGen = require('../helpers/hashGen.js');
var router = express.Router()

//middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next();
})

router.post("/",function(req,res){
	console.log(req.body);
	var username = req.body.username;
	var email = req.body.email
	var password = req.body.password
	var fields = {}
	fields["username"] = username;
	fields["email"] = email
	fields["password"] = hashGen.hash(password);
	User.save(fields,function(err,rows){
		if(!err){
			res.send("Signup Done");
		}
	});
});

module.exports = router