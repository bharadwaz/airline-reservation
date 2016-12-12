var express = require('express')
var logger = require('../helpers/logger.js');
var selectParser = require('../helpers/selectParser.js');
var User = require('../models/userinfo.js');
var hashGen = require('../helpers/hashGen.js');
var passport = require('passport');
var router = express.Router()

//middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log("^^^^^^^^ search Request ^^^^^^^^^");
  console.log('Time: ', Date.now())
  next();
})

router.get('/', function(req, res){
	res.render('front',{});
})

module.exports = router